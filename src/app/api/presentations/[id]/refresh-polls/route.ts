import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface ParsedPoll {
  slideNumber: number;
  question: string;
  options: string[];
}

function parseAllPollsFromContent(content: string): ParsedPoll[] {
  const polls: ParsedPoll[] = [];
  
  // Split content by slide separators
  const slides = content.split(/^---$/m);
  
  slides.forEach((slide, index) => {
    // Look for Poll components in this slide
    const pollMatches = slide.matchAll(/<Poll[\s\S]*?\/>/g);
    
    for (const match of pollMatches) {
      const pollContent = match[0];
      
      // Extract question - handle both double and single quotes properly
      let questionMatch = pollContent.match(/question="([\s\S]*?)"/);
      if (!questionMatch) {
        questionMatch = pollContent.match(/question='([\s\S]*?)'/);
      }
      if (!questionMatch) {
        console.warn(`No question found in poll on slide ${index + 1}`);
        continue;
      }
      const question = questionMatch[1];
      
      if (!question.trim()) {
        console.warn(`Empty question found in poll on slide ${index + 1}`);
        continue;
      }
      
      // Extract options array
      const optionsMatch = pollContent.match(/options=\{\[([\s\S]*?)\]\}/);
      if (!optionsMatch) {
        console.warn(`No options found in poll on slide ${index + 1}`);
        continue;
      }
      
      // Parse options - they're strings separated by commas, but respect quotes
      const optionsString = optionsMatch[1];
      
      // Split by commas but respect quoted strings
      const options: string[] = [];
      let current = '';
      let inQuotes = false;
      let quoteChar = '';
      
      for (let i = 0; i < optionsString.length; i++) {
        const char = optionsString[i];
        
        if (!inQuotes && (char === '"' || char === "'")) {
          inQuotes = true;
          quoteChar = char;
        } else if (inQuotes && char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        } else if (!inQuotes && char === ',') {
          const option = current.trim().replace(/^["']|["']$/g, '');
          if (option.length > 0) {
            options.push(option);
          }
          current = '';
          continue;
        }
        
        current += char;
      }
      
      // Add the last option
      const lastOption = current.trim().replace(/^["']|["']$/g, '');
      if (lastOption.length > 0) {
        options.push(lastOption);
      }
      
      if (options.length > 0) {
        const poll = {
          slideNumber: index + 1, // 1-based slide numbering
          question,
          options
        };
        polls.push(poll);
      }
    }
  });
  
  return polls;
}

export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const presentationId = params.id;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing content parameter' }, { status: 400 });
    }

    // Parse all polls from the markdown content
    const polls = parseAllPollsFromContent(content);

    // First, clear all existing polls for this presentation
    const { data: existingPolls, error: pollsSelectError } = await supabaseAdmin
      .from('web_pres_polls')
      .select('id')
      .eq('presentation_id', presentationId);
    
    if (pollsSelectError) {
      console.error('Error fetching polls:', pollsSelectError);
      return NextResponse.json({ error: pollsSelectError.message }, { status: 500 });
    }
    
    if (existingPolls && existingPolls.length > 0) {
      const pollIds = existingPolls.map(p => p.id);
      
      // Delete votes first (foreign key constraint)
      const { error: votesError } = await supabaseAdmin
        .from('web_pres_votes')
        .delete()
        .in('poll_id', pollIds);
      
      if (votesError) {
        console.error('Error deleting votes:', votesError);
        return NextResponse.json({ error: votesError.message }, { status: 500 });
      }
      
      // Delete poll options
      const { error: optionsError } = await supabaseAdmin
        .from('web_pres_poll_options')
        .delete()
        .in('poll_id', pollIds);
      
      if (optionsError) {
        console.error('Error deleting poll options:', optionsError);
        return NextResponse.json({ error: optionsError.message }, { status: 500 });
      }
      
      // Delete polls
      const { error: pollsError } = await supabaseAdmin
        .from('web_pres_polls')
        .delete()
        .eq('presentation_id', presentationId);
      
      if (pollsError) {
        console.error('Error deleting polls:', pollsError);
        return NextResponse.json({ error: pollsError.message }, { status: 500 });
      }
    }

    // Create new polls
    const createdPolls = [];
    for (const poll of polls) {
      // Create poll
      const { data: newPoll, error: pollError } = await supabaseAdmin
        .from('web_pres_polls')
        .insert({
          presentation_id: presentationId,
          slide_number: poll.slideNumber,
          question: poll.question,
          is_active: true
        })
        .select()
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        return NextResponse.json({ error: pollError.message }, { status: 500 });
      }

      // Create poll options
      const optionsData = poll.options.map((option: string, index: number) => ({
        poll_id: newPoll.id,
        option_text: option,
        vote_count: 0,
        order_index: index
      }));

      const { error: optionsError } = await supabaseAdmin
        .from('web_pres_poll_options')
        .insert(optionsData);

      if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        return NextResponse.json({ error: optionsError.message }, { status: 500 });
      }

      createdPolls.push(newPoll);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Refreshed ${createdPolls.length} polls successfully`,
      polls: createdPolls
    });
  } catch (error) {
    console.error('Poll refresh error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 
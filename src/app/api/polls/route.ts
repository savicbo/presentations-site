import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Create or reset a poll
export async function POST(request: NextRequest) {
  try {
    const { presentationId, slideNumber, question, options } = await request.json();

    // Create new poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('web_pres_polls')
      .insert({
        presentation_id: presentationId,
        slide_number: slideNumber,
        question,
        is_active: true
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      return NextResponse.json({ error: pollError.message }, { status: 500 });
    }

    // Create poll options
    const optionsData = options.map((option: string, index: number) => ({
      poll_id: poll.id,
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

    return NextResponse.json(poll);
  } catch (error) {
    console.error('Poll creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// Get polls for a presentation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presentationId = searchParams.get('presentationId');

    if (!presentationId) {
      return NextResponse.json({ error: 'Missing presentationId parameter' }, { status: 400 });
    }

    const { data: polls } = await supabaseAdmin
      .from('web_pres_polls')
      .select(`
        *,
        web_pres_poll_options (*)
      `)
      .eq('presentation_id', presentationId)
      .eq('is_active', true);

    return NextResponse.json({ polls: polls || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Clear all polls for a presentation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presentationId = searchParams.get('presentationId');

    if (!presentationId) {
      return NextResponse.json({ error: 'Missing presentationId parameter' }, { status: 400 });
    }


    
    // First get all poll IDs for this presentation
    const { data: polls, error: pollsSelectError } = await supabaseAdmin
      .from('web_pres_polls')
      .select('id')
      .eq('presentation_id', presentationId);
    
    if (pollsSelectError) {
      console.error('Error fetching polls:', pollsSelectError);
      return NextResponse.json({ error: pollsSelectError.message }, { status: 500 });
    }
    
    if (!polls || polls.length === 0) {
      return NextResponse.json({ success: true, message: 'No polls to delete' });
    }
    
    const pollIds = polls.map(p => p.id);
    
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
    
    return NextResponse.json({ success: true, message: 'All polls cleared successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

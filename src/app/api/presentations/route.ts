import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateShortId } from '@/lib/presentation-helpers';

// Create a new presentation
export async function POST(request: NextRequest) {
  try {
    const { title, shortId } = await request.json();
    
    const presentationShortId = shortId || generateShortId();
    
    // Check if short ID already exists
    const { data: existing } = await supabaseAdmin
      .from('web_pres_presentations')
      .select('id')
      .eq('short_id', presentationShortId)
      .single();
    
    if (existing) {
      return NextResponse.json({ error: 'Short ID already exists' }, { status: 409 });
    }
    
    const { data: presentation, error } = await supabaseAdmin
      .from('web_pres_presentations')
      .insert({
        title,
        short_id: presentationShortId,
        current_slide: 1
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating presentation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(presentation);
  } catch (error) {
    console.error('Presentation creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

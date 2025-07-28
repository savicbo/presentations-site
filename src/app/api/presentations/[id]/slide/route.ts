import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Update current slide for a presentation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { slideNumber } = await request.json();
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('web_pres_presentations')
      .update({ current_slide: slideNumber })
      .eq('id', id);

    if (error) {
      console.error('Error updating current slide:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

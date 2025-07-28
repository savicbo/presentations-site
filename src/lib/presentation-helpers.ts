import { supabase } from './supabase';
import type { WebPresPresentation, WebPresPoll, WebPresPollOption } from './supabase';

// Removed content hashing logic since we now use manual refresh

// Generate a random short ID for presentations
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Removed complex hashing and automatic poll creation logic since we now use manual refresh

// Create a new presentation in the database
export async function createPresentation(title: string, shortId?: string): Promise<WebPresPresentation | null> {
  const presentationShortId = shortId || generateShortId();
  
  try {
    const response = await fetch('/api/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        shortId: presentationShortId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating presentation:', error);
      return null;
    }

    const data = await response.json();
    console.log('Created presentation:', data);
    return data;
  } catch (error) {
    console.error('Error creating presentation:', error);
    return null;
  }
}

// Get presentation by short ID
export async function getPresentationByShortId(shortId: string): Promise<WebPresPresentation | null> {
  const { data, error } = await supabase
    .from('web_pres_presentations')
    .select('*')
    .eq('short_id', shortId)
    .single();

  if (error) {
    console.error('Error fetching presentation:', error);
    return null;
  }

  return data;
}

// Update current slide for a presentation
export async function updateCurrentSlide(presentationId: string, slideNumber: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/presentations/${presentationId}/slide`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slideNumber })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating current slide:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating current slide:', error);
    return false;
  }
}



// Get active poll for a specific slide
export async function getPollForSlide(
  presentationId: string,
  slideNumber: number
): Promise<{ poll: WebPresPoll; options: WebPresPollOption[] } | null> {
  
  // Get the active poll for this slide (most recent active poll)
  const { data: polls, error: pollError } = await supabase
    .from('web_pres_polls')
    .select('*')
    .eq('presentation_id', presentationId)
    .eq('slide_number', slideNumber)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (pollError) {
    console.error('Error fetching poll:', pollError);
    return null;
  }
  
  if (!polls || polls.length === 0) {
    return null;
  }
  
  const poll = polls[0];
  
  // Get the poll options ordered by their original slide order
  // Fallback to id ordering if order_index doesn't exist yet
  const { data: options, error: optionsError } = await supabase
    .from('web_pres_poll_options')
    .select('*')
    .eq('poll_id', poll.id)
    .order('order_index', { nullsFirst: false })
    .order('id');
    
  if (optionsError) {
    console.error('Error fetching poll options:', optionsError);
    return null;
  }
  
  return { poll, options: options || [] };
}

// Cast a vote using atomic RPC function
export async function castVote(optionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_vote', {
      poll_option_id: optionId
    });

    if (error) {
      console.error('Error casting vote:', error);
      return false;
    }

    if (data && !data.success) {
      console.error('Vote failed:', data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    return false;
  }
}

// Subscribe to presentation updates
export function subscribeToPresentationUpdates(
  shortId: string,
  onUpdate: (presentation: WebPresPresentation) => void
) {
  return supabase
    .channel(`presentation-${shortId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'web_pres_presentations',
        filter: `short_id=eq.${shortId}`
      },
      (payload) => {
        onUpdate(payload.new as WebPresPresentation);
      }
    )
    .subscribe();
}

// Subscribe to poll updates
export function subscribeToPollUpdates(
  pollId: string,
  onUpdate: (options: WebPresPollOption[]) => void
) {
  return supabase
    .channel(`poll-${pollId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'web_pres_poll_options',
        filter: `poll_id=eq.${pollId}`
      },
      async () => {
        // Fetch updated poll options in slide order
        const { data } = await supabase
          .from('web_pres_poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('order_index')
          .order('id');
        
        if (data) {
          onUpdate(data);
        }
      }
    )
    .subscribe();
}



// Removed createOrResetPoll and createPollSimple functions since we now use manual refresh

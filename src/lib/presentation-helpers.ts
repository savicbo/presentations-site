import { supabase } from './supabase';
import type { WebPresPresentation, WebPresPoll, WebPresPollOption } from './supabase';

// Simple in-memory lock to prevent race conditions when creating polls
const pollCreationLocks = new Map<string, Promise<WebPresPoll | null>>();

// Generate a content hash for poll question and options
export function generatePollContentHash(question: string, options: string[]): string {
  const content = question + '|' + options.sort().join('|');
  // Simple hash function - in production you might want to use crypto.subtle.digest
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Generate a random short ID for presentations
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new presentation in the database
export async function createPresentation(title: string, shortId?: string): Promise<WebPresPresentation | null> {
  const presentationShortId = shortId || generateShortId();
  
  const { data, error } = await supabase
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
    return null;
  }

  return data;
}

// Get presentation by short ID
export async function getPresentationByShortId(shortId: string): Promise<WebPresPresentation | null> {
  console.log('Getting presentation by short ID:', shortId);
  
  const { data, error } = await supabase
    .from('web_pres_presentations')
    .select('*')
    .eq('short_id', shortId)
    .single();

  if (error) {
    console.error('Error fetching presentation:', error);
    return null;
  }

  console.log('Found presentation:', data);
  return data;
}

// Update current slide for a presentation
export async function updateCurrentSlide(presentationId: string, slideNumber: number): Promise<boolean> {
  const { error } = await supabase
    .from('web_pres_presentations')
    .update({ current_slide: slideNumber })
    .eq('id', presentationId);

  if (error) {
    console.error('Error updating current slide:', error);
    return false;
  }

  return true;
}

// Legacy function - no longer needed with content hash approach
// Keeping for compatibility but it's not used anymore
async function createPollWithRetry(
  presentationId: string,
  slideNumber: number,
  question: string,
  options: string[],
  retryCount = 0
): Promise<WebPresPoll | null> {
  console.log('createPollWithRetry is deprecated - use createPollWithOptions instead');
  const contentHash = generatePollContentHash(question, options);
  return await createPollWithOptions(presentationId, slideNumber, question, options, contentHash);
}

// Create a poll for a specific slide with content hash
export async function createPoll(
  presentationId: string,
  slideNumber: number,
  question: string,
  options: string[],
  contentHash: string
): Promise<WebPresPoll | null> {
  console.log('Attempting to create poll for slide', slideNumber, 'with hash', contentHash);
  
  // First create the poll with content hash
  const { data: poll, error: pollError } = await supabase
    .from('web_pres_polls')
    .insert({
      presentation_id: presentationId,
      slide_number: slideNumber,
      question,
      content_hash: contentHash,
      is_active: true
    })
    .select()
    .single();

  if (pollError) {
    console.error('Error creating poll:', JSON.stringify(pollError, null, 2));
    console.error('Poll error details:', {
      code: pollError.code,
      message: pollError.message,
      details: pollError.details,
      hint: pollError.hint
    });
    // If it's a unique constraint violation, the poll with this content already exists
    if (pollError.code === '23505') {
      console.log('Poll with this content already exists, fetching existing poll');
      const existingPoll = await getPollForSlide(presentationId, slideNumber);
      return existingPoll?.poll || null;
    }
    return null;
  }

  console.log('Created poll:', poll.id);
  return poll;
}

// Get active poll for a specific slide
export async function getPollForSlide(
  presentationId: string,
  slideNumber: number
): Promise<{ poll: WebPresPoll; options: WebPresPollOption[] } | null> {
  console.log('Getting active poll for slide:', { presentationId, slideNumber });
  
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
    console.log('No active poll found for slide');
    return null;
  }
  
  const poll = polls[0];
  console.log('Found active poll:', poll);
  
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
  
  console.log('Found poll options:', options);
  return { poll, options: options || [] };
}

// Cast a vote
export async function castVote(pollId: string, optionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('web_pres_votes')
    .insert({
      poll_id: pollId,
      option_id: optionId
    });

  if (error) {
    console.error('Error casting vote:', error);
    return false;
  }

  return true;
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

// Deactivate an existing poll (mark as inactive instead of deleting)
export async function deactivatePoll(pollId: string): Promise<boolean> {
  console.log('Deactivating poll:', pollId);
  
  const { error } = await supabase
    .from('web_pres_polls')
    .update({ is_active: false })
    .eq('id', pollId);
    
  if (error) {
    console.error('Error deactivating poll:', error);
    return false;
  }
  
  console.log('Successfully deactivated poll:', pollId);
  return true;
}

// Deactivate ALL polls for a specific slide (ensures clean state)
export async function deactivateAllPollsForSlide(
  presentationId: string,
  slideNumber: number
): Promise<boolean> {
  console.log('Deactivating all polls for slide:', slideNumber);
  
  const { error } = await supabase
    .from('web_pres_polls')
    .update({ is_active: false })
    .eq('presentation_id', presentationId)
    .eq('slide_number', slideNumber);
    
  if (error) {
    console.error('Error deactivating polls for slide:', error);
    return false;
  }
  
  console.log('Successfully deactivated all polls for slide:', slideNumber);
  return true;
}

// Get an inactive poll by content hash (for reactivation)
export async function getInactivePollByContentHash(
  presentationId: string,
  slideNumber: number,
  contentHash: string
): Promise<WebPresPoll | null> {
  console.log('Looking for inactive poll with content hash:', contentHash);
  
  const { data: poll, error } = await supabase
    .from('web_pres_polls')
    .select('*')
    .eq('presentation_id', presentationId)
    .eq('slide_number', slideNumber)
    .eq('content_hash', contentHash)
    .eq('is_active', false)
    .single();
    
  if (error) {
    if (error.code !== 'PGRST116') { // Not found is OK
      console.error('Error finding inactive poll:', error);
    }
    return null;
  }
  
  console.log('Found inactive poll:', poll.id);
  return poll;
}

// Reactivate a poll (mark as active)
export async function reactivatePoll(pollId: string): Promise<boolean> {
  console.log('Reactivating poll:', pollId);
  
  const { error } = await supabase
    .from('web_pres_polls')
    .update({ is_active: true })
    .eq('id', pollId);
    
  if (error) {
    console.error('Error reactivating poll:', error);
    return false;
  }
  
  console.log('Successfully reactivated poll:', pollId);
  return true;
}

// Create a poll with options in a single transaction-like operation
export async function createPollWithOptions(
  presentationId: string,
  slideNumber: number,
  question: string,
  options: string[],
  contentHash: string
): Promise<WebPresPoll | null> {
  console.log('Creating poll with options for slide', slideNumber, 'hash:', contentHash);
  
  // Create the poll
  const poll = await createPoll(presentationId, slideNumber, question, options, contentHash);
  if (!poll) {
    console.error('Failed to create poll');
    return null;
  }
  
  // Create poll options with order index to preserve slide order
  const pollOptions = options.map((option, index) => ({
    poll_id: poll.id,
    option_text: option,
    vote_count: 0,
    order_index: index
  }));
  
  const { error: optionsError } = await supabase
    .from('web_pres_poll_options')
    .insert(pollOptions);
    
  if (optionsError) {
    console.error('Error creating poll options:', optionsError);
    // Clean up the poll if options creation failed
    await supabase.from('web_pres_polls').delete().eq('id', poll.id);
    return null;
  }
  
  console.log('Successfully created poll with options:', poll.id);
  return poll;
}

// Archive an existing poll by deleting it (legacy function - now we use deactivation)
export async function archivePoll(pollId: string): Promise<boolean> {
  console.log('Archiving poll by deletion (legacy):', pollId);
  
  // First delete all poll options
  const { error: optionsError } = await supabase
    .from('web_pres_poll_options')
    .delete()
    .eq('poll_id', pollId);
    
  if (optionsError) {
    console.error('Error deleting poll options:', optionsError);
    return false;
  }
  
  // Then delete all votes for this poll
  const { error: votesError } = await supabase
    .from('web_pres_votes')
    .delete()
    .eq('poll_id', pollId);
    
  if (votesError) {
    console.error('Error deleting poll votes:', votesError);
    // Continue anyway, votes table might not have this poll_id column
  }
  
  // Finally delete the poll itself
  const { error: pollError } = await supabase
    .from('web_pres_polls')
    .delete()
    .eq('id', pollId);

  if (pollError) {
    console.error('Error deleting poll:', pollError);
    return false;
  }
  
  console.log('Successfully archived (deleted) poll:', pollId);
  return true;
}

// forceReplacePoll function removed - no longer needed with content hash approach

// Create or reset a poll based on markdown content (using content hash approach)
export async function createOrResetPoll(
  presentationId: string,
  slideNumber: number,
  question: string,
  options: string[]
): Promise<WebPresPoll | null> {
  const lockKey = `${presentationId}-${slideNumber}`;
  
  // Check if there's already a poll creation in progress for this slide
  if (pollCreationLocks.has(lockKey)) {
    console.log('🔒 Poll creation already in progress, waiting for it to complete...');
    return await pollCreationLocks.get(lockKey)!;
  }
  
  // Create the poll creation promise and store it in the lock
  const pollCreationPromise = createOrResetPollInternal(presentationId, slideNumber, question, options);
  pollCreationLocks.set(lockKey, pollCreationPromise);
  
  try {
    const result = await pollCreationPromise;
    return result;
  } finally {
    // Always clean up the lock when done
    pollCreationLocks.delete(lockKey);
  }
}

// Internal implementation using content hash approach - no more deletion needed!
async function createOrResetPollInternal(
  presentationId: string,
  slideNumber: number,
  question: string,
  options: string[]
): Promise<WebPresPoll | null> {
  console.log('=== createOrResetPoll called (content hash approach) ===');
  console.log('Presentation ID:', presentationId);
  console.log('Slide Number:', slideNumber);
  console.log('Question:', question);
  console.log('Options:', options);
  
  const contentHash = generatePollContentHash(question, options);
  console.log('Generated content hash:', contentHash);
  
  // Check if an active poll exists for this slide
  console.log('Checking for existing active poll...');
  const existingPoll = await getPollForSlide(presentationId, slideNumber);
  
  if (existingPoll) {
    // Check if the existing poll has the same content
    if (existingPoll.poll.content_hash === contentHash) {
      console.log('✅ Poll content unchanged, using existing poll:', existingPoll.poll.id);
      return existingPoll.poll;
    } else {
      console.log('🔄 Poll content changed, creating new poll and deactivating old one');
      console.log('Hash comparison: existing =', existingPoll.poll.content_hash, ', new =', contentHash);
      
      // Deactivate ALL polls for this slide to ensure clean state
      await deactivateAllPollsForSlide(presentationId, slideNumber);
      
      // Create new poll with new content hash
      const newPoll = await createPollWithOptions(presentationId, slideNumber, question, options, contentHash);
      console.log('New poll result:', newPoll ? newPoll.id : 'FAILED');
      return newPoll;
    }
  } else {
    console.log('No existing active poll found, checking for inactive poll with same content hash');
    
    // Check if there's an inactive poll with the same content hash we can reactivate
    const inactivePoll = await getInactivePollByContentHash(presentationId, slideNumber, contentHash);
    
    if (inactivePoll) {
      console.log('🔄 Found inactive poll with same content hash, reactivating:', inactivePoll.id);
      const reactivated = await reactivatePoll(inactivePoll.id);
      if (reactivated) {
        return inactivePoll;
      }
    }
    
    // Create new poll with new content hash
    console.log('🆕 Creating new poll with content hash:', contentHash);
    const newPoll = await createPollWithOptions(presentationId, slideNumber, question, options, contentHash);
    console.log('New poll result:', newPoll ? newPoll.id : 'FAILED');
    return newPoll;
  }
}

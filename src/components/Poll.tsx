'use client';

import { useState, useEffect } from 'react';
import { createOrResetPoll, getPollForSlide, subscribeToPollUpdates, getPresentationByShortId, createPresentation } from '@/lib/presentation-helpers';
import type { WebPresPollOption } from '@/lib/supabase';

interface PollProps {
  question: string;
  options: string[];
  presentationShortId?: string;
  slideNumber?: number;
}

export default function Poll({ question, options, presentationShortId = 'demo123', slideNumber = 1 }: PollProps) {
  const [pollOptions, setPollOptions] = useState<WebPresPollOption[]>([]);
  const [pollId, setPollId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePoll = async () => {
      try {
        // Get or create presentation
        let presentation = await getPresentationByShortId(presentationShortId);
        if (!presentation) {
          console.log('Presentation not found, creating new one with shortId:', presentationShortId);
          presentation = await createPresentation(`Presentation ${presentationShortId}`, presentationShortId);
          if (!presentation) {
            console.error('Failed to create presentation');
            setLoading(false);
            return;
          }
        }

        // Create or reset poll based on markdown content (this handles content changes automatically)
        console.log('Creating or resetting poll for slide', slideNumber, 'with question:', question);
        const poll = await createOrResetPoll(presentation.id, slideNumber, question, options);
        
        if (poll) {
          setPollId(poll.id);
          // Fetch the poll options
          const pollData = await getPollForSlide(presentation.id, slideNumber);
          if (pollData) {
            setPollOptions(pollData.options);
          }
        } else {
          console.error('Failed to create or reset poll - poll creation returned null');
          // Try to fetch any existing poll as fallback
          const fallbackPollData = await getPollForSlide(presentation.id, slideNumber);
          if (fallbackPollData) {
            console.log('Using fallback poll:', fallbackPollData.poll.id);
            setPollId(fallbackPollData.poll.id);
            setPollOptions(fallbackPollData.options);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing poll:', error);
        
        // Check if this is a production environment error (admin operations not available)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Admin operations not available in production')) {
          console.log('Running in production mode - admin operations disabled');
          // In production, try to fetch existing poll only
          try {
            const fallbackPresentation = await getPresentationByShortId(presentationShortId);
            if (fallbackPresentation) {
              const fallbackPollData = await getPollForSlide(fallbackPresentation.id, slideNumber);
              if (fallbackPollData) {
                console.log('Using existing poll in production mode:', fallbackPollData.poll.id);
                setPollId(fallbackPollData.poll.id);
                setPollOptions(fallbackPollData.options);
              } else {
                console.log('No existing poll found in production mode');
              }
            }
          } catch (fallbackError) {
            console.error('Failed to fetch existing poll in production:', fallbackError);
          }
        } else {
          // Try to fetch any existing poll as fallback for other errors
          try {
            const fallbackPresentation = await getPresentationByShortId(presentationShortId);
            if (fallbackPresentation) {
              const fallbackPollData = await getPollForSlide(fallbackPresentation.id, slideNumber);
              if (fallbackPollData) {
                console.log('Using fallback poll after error:', fallbackPollData.poll.id);
                setPollId(fallbackPollData.poll.id);
                setPollOptions(fallbackPollData.options);
              }
            }
          } catch (fallbackError) {
            console.error('Fallback poll fetch also failed:', fallbackError);
          }
        }
        setLoading(false);
      }
    };

    // Only initialize if we don't already have a poll ID
    if (!pollId) {
      initializePoll();
    }
  }, [question, options, presentationShortId, slideNumber, pollId]);

  useEffect(() => {
    if (!pollId) return;

    // Subscribe to poll updates
    const subscription = subscribeToPollUpdates(pollId, (updatedOptions) => {
      setPollOptions(updatedOptions);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pollId]);

  if (loading) {
    return (
      <div className="poll-container">
        <h3 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Loading poll...</h3>
      </div>
    );
  }

  const totalVotes = pollOptions.reduce((sum, option) => sum + option.vote_count, 0);

  return (
    <div className="poll-container">
      <h3 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{question}</h3>
      
      <div className="poll-results">
        {pollOptions.map((option, index) => {
          const votes = option.vote_count;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          // Calculate number of boxes (0-10)
          const numBoxes = Math.round(percentage / 10);
          
          return (
            <div key={option.id} className="poll-option">
              <div className="poll-bar">
                <span className="poll-bar-text">
                  {index + 1}) {option.option_text}
                </span>
                <div className="poll-bar-boxes">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div 
                      key={i}
                      className={`poll-box ${i < numBoxes ? 'poll-box-filled' : 'poll-box-empty'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="poll-stats">
                {votes} votes ({Math.round(percentage)}%)
              </div>
            </div>
          );
        })}
      </div>
      
      <p style={{ marginTop: '1rem', fontSize: '1.25rem', opacity: 0.8 }}>
        Total votes: {totalVotes}
      </p>
    </div>
  );
}

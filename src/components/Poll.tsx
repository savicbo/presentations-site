'use client';

import { useState, useEffect } from 'react';
import { getPollForSlide, subscribeToPollUpdates, getPresentationByShortId } from '@/lib/presentation-helpers';
import type { WebPresPollOption } from '@/lib/supabase';

interface PollProps {
  question: string;
  presentationShortId?: string;
  slideNumber?: number;
  disableSubscription?: boolean;
}

export default function Poll({ question, presentationShortId = 'demo123', slideNumber = 1, disableSubscription = false }: PollProps) {
  const [pollOptions, setPollOptions] = useState<WebPresPollOption[]>([]);
  const [pollId, setPollId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePoll = async () => {
      try {
        // Get presentation
        const presentation = await getPresentationByShortId(presentationShortId);
        if (!presentation) {
          console.log('No presentation found for short ID:', presentationShortId);
          setLoading(false);
          return;
        }

        // Get the poll for this slide
        const pollData = await getPollForSlide(presentation.id, slideNumber);
        
        if (pollData) {
          setPollId(pollData.poll.id);
          setPollOptions(pollData.options);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing poll:', error);
        setLoading(false);
      }
    };

    initializePoll();
  }, [presentationShortId, slideNumber]);

  useEffect(() => {
    if (!pollId || disableSubscription) return;

    // Subscribe to poll updates
    const subscription = subscribeToPollUpdates(pollId, (updatedOptions) => {
      setPollOptions(updatedOptions);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pollId, disableSubscription]);

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

'use client';

import { useState, useEffect } from 'react';
import { subscribeToPresentationUpdates, getPollForSlide, castVote, subscribeToPollUpdates } from '@/lib/presentation-helpers';
import type { WebPresPresentation, WebPresPollOption, WebPresPoll } from '@/lib/supabase';

interface AudienceViewProps {
  presentation: WebPresPresentation;
}

export default function AudienceView({ presentation }: AudienceViewProps) {
  const [currentSlide, setCurrentSlide] = useState(presentation.current_slide);
  const [poll, setPoll] = useState<WebPresPoll | null>(null);
  const [pollOptions, setPollOptions] = useState<WebPresPollOption[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    // Subscribe to presentation updates
    const subscription = subscribeToPresentationUpdates(
      presentation.short_id,
      (updatedPresentation) => {
        setCurrentSlide(updatedPresentation.current_slide);
        setHasVoted(false); // Reset voting status when slide changes
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [presentation.short_id]);

  useEffect(() => {
    // Check if current slide has a poll
    const checkForPoll = async () => {
      const pollData = await getPollForSlide(presentation.id, currentSlide);
      if (pollData) {
        setPoll(pollData.poll);
        setPollOptions(pollData.options);
      } else {
        setPoll(null);
        setPollOptions([]);
      }
    };

    checkForPoll();
  }, [presentation.id, currentSlide]);

  useEffect(() => {
    if (!poll) return;

    // Subscribe to poll updates for real-time results
    const subscription = subscribeToPollUpdates(poll.id, (updatedOptions) => {
      setPollOptions(updatedOptions);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [poll]);

  const handleVote = async (optionId: string) => {
    if (hasVoted || voting || !poll) return;

    setVoting(true);
    const success = await castVote(optionId);
    
    if (success) {
      setHasVoted(true);
      // Poll options will update automatically via Supabase Realtime
    }
    
    setVoting(false);
  };

  return (
    <div className="min-h-screen bg-presentation-bg text-white font-primary p-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{presentation.title}</h1>
          <p className="text-sm opacity-75">Slide {currentSlide}</p>
        </header>

        {poll ? (
          <div className="p-6" style={{ backgroundColor: '#0a2950' }}>
            <h2 className="text-2xl font-semibold mb-4">{poll.question}</h2>
            
            {hasVoted ? (
              <div>
                <p className="text-white mb-4 text-lg">✓ Vote submitted!</p>
                <div className="space-y-2">
                  {pollOptions.map((option) => {
                    const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.vote_count, 0);
                    const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={option.id} className="border border-white p-3" style={{ backgroundColor: '#0a2950' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-lg">{option.option_text}</span>
                          <span className="text-base">{option.vote_count} votes</span>
                        </div>
                        <div className="w-full border border-white h-2">
                          <div 
                            className="bg-white h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-white opacity-75 mt-1">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pollOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={voting}
                    className="w-full border border-white p-4 transition-colors text-left text-lg disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#0a2950',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#0a2950';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0a2950';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    {voting ? 'Submitting...' : option.option_text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="border-2 border-white p-8" style={{ backgroundColor: '#0a2950' }}>
              <h2 className="text-2xl mb-4">Waiting for poll...</h2>
              <p className="text-base opacity-75">
                The presenter will share a poll when ready.
              </p>
            </div>
          </div>
        )}

        <footer className="text-center mt-8 text-sm opacity-50">
          <p>Page will auto-update with the presentation</p>
        </footer>
      </div>
    </div>
  );
}

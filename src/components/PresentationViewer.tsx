'use client';

import { useState, useEffect, useCallback } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import Poll from './Poll';
import FloatingQR from './FloatingQR';
import PixelIcon, { 
  PixelCautionIcon,
  PixelGitHubIcon,
  PixelTwitterIcon,
  PixelLinkedInIcon,
  PixelEmailIcon,
  PixelHomeIcon,
  PixelSearchIcon,
  PixelSettingsIcon,
  PixelUserIcon,
  PixelHeartIcon,
  PixelCatFaceIcon
} from './PixelIcon';
import Video, { VimeoVideo, YouTubeVideo } from './Video';
import { getPresentationByShortId, updateCurrentSlide, createPresentation } from '@/lib/presentation-helpers';
import { getTransitionByName, DEFAULT_TRANSITION } from '@/config/transitions';
import '@/styles/transitions.css';

interface Slide {
  id: number;
  content: MDXRemoteSerializeResult;
}

interface PresentationConfig {
  title: string;
  theme: string;
  shortId: string;
  customUrl?: string;
  transition?: string;
  slides: Array<{
    id: number;
    title: string;
    content: string;
  }>;
}

interface PresentationViewerProps {
  config: PresentationConfig;
  slidesContent: string;
}

const components = {
  Poll,
  PixelIcon,
  PixelCautionIcon,
  PixelGitHubIcon,
  PixelTwitterIcon,
  PixelLinkedInIcon,
  PixelEmailIcon,
  PixelHomeIcon,
  PixelSearchIcon,
  PixelSettingsIcon,
  PixelUserIcon,
  PixelHeartIcon,
  PixelCatFaceIcon,
  Video,
  VimeoVideo,
  YouTubeVideo,
};

export default function PresentationViewer({ config, slidesContent }: PresentationViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextSlideIndex, setNextSlideIndex] = useState<number | null>(null);
  const [slideInputValue, setSlideInputValue] = useState('1');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const initializePresentation = async () => {
      try {
        // Get presentation from database, create if it doesn't exist
        let presentation = await getPresentationByShortId(config.shortId);
        if (!presentation) {
          // Create presentation in database if it doesn't exist
          presentation = await createPresentation(config.title, config.shortId);
        }
        
        if (presentation) {
          setPresentationId(presentation.id);
          setCurrentSlide(presentation.current_slide - 1); // Convert to 0-based index
        }
        
        // Split the MDX content by slide separators (---)
        const slideContents = slidesContent.split('---').map(content => content.trim()).filter(Boolean);
        
        const parsedSlides = await Promise.all(
          slideContents.map(async (content, index) => ({
            id: index + 1,
            content: await serialize(content, {
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                development: process.env.NODE_ENV === 'development'
              }
            })
          }))
        );
        
        console.log('Parsed slides:', parsedSlides.length);
        setSlides(parsedSlides);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing presentation:', error);
        setLoading(false);
      }
    };

    initializePresentation();
  }, [slidesContent, mounted, config.shortId, config.title]);



  const transitionToSlide = useCallback(async (newSlideIndex: number) => {
    if (isTransitioning || newSlideIndex === currentSlide) return;
    
    const transitionConfig = getTransitionByName(config.transition || DEFAULT_TRANSITION);
    
    if (transitionConfig.duration === 0) {
      // No transition - instant change
      setCurrentSlide(newSlideIndex);
      if (presentationId) {
        await updateCurrentSlide(presentationId, newSlideIndex + 1);
      }
      return;
    }
    
    // For fade and defocus transitions, we need a different approach
    if (transitionConfig.name === 'fade' || transitionConfig.name === 'defocus') {
      setIsTransitioning(true);
      
      // First fade out current slide
      setTimeout(() => {
        // Then change slide and fade in
        setCurrentSlide(newSlideIndex);
        setTimeout(() => {
          setIsTransitioning(false);
        }, transitionConfig.duration / 2);
      }, transitionConfig.duration / 2);
      
      // Update database
      if (presentationId) {
        await updateCurrentSlide(presentationId, newSlideIndex + 1);
      }
    } else {
      // For other transitions, show both slides
      setIsTransitioning(true);
      setNextSlideIndex(newSlideIndex);
      
      // Wait for transition duration
      setTimeout(async () => {
        setCurrentSlide(newSlideIndex);
        setNextSlideIndex(null);
        setIsTransitioning(false);
        
        // Update database
        if (presentationId) {
          await updateCurrentSlide(presentationId, newSlideIndex + 1);
        }
      }, transitionConfig.duration);
    }
  }, [isTransitioning, currentSlide, config.transition, presentationId]);

  const nextSlide = useCallback(async () => {
    console.log('Next clicked, current:', currentSlide, 'total:', slides.length);
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      await transitionToSlide(currentSlide + 1);
    }
  }, [currentSlide, slides.length, isTransitioning, transitionToSlide]);

  const prevSlide = useCallback(async () => {
    console.log('Prev clicked, current:', currentSlide);
    if (currentSlide > 0 && !isTransitioning) {
      await transitionToSlide(currentSlide - 1);
    }
  }, [currentSlide, isTransitioning, transitionToSlide]);

  // Keyboard navigation effect
  useEffect(() => {
    if (!mounted || loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted, loading, isTransitioning, nextSlide, prevSlide]);

  const goToSlide = async (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < slides.length && slideIndex !== currentSlide && !isTransitioning) {
      await transitionToSlide(slideIndex);
    }
  };

  // Update input value when current slide changes
  useEffect(() => {
    setSlideInputValue((currentSlide + 1).toString());
  }, [currentSlide]);

  const refreshPolls = async () => {
    if (!presentationId || refreshing) return;

    setRefreshing(true);
    try {
      const response = await fetch(`/api/presentations/${presentationId}/refresh-polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: slidesContent })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Polls refreshed:', result.message);
        // Polls will update automatically via Supabase Realtime
      } else {
        const error = await response.json();
        console.error('Error refreshing polls:', error);
      }
    } catch (error) {
      console.error('Error refreshing polls:', error);
    } finally {
      setRefreshing(false);
    }
  };



  if (!mounted || loading) {
    return (
      <div className="presentation-theme-default">
        <div className="slide">
          <h1>Loading presentation...</h1>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="presentation-theme-default">
        <div className="slide">
          <h1>No slides found</h1>
        </div>
      </div>
    );
  }

  const transitionConfig = getTransitionByName(config.transition || DEFAULT_TRANSITION);
  
  return (
    <div className={`presentation-theme-${config.theme}`}>
      <div className={`slide-container ${transitionConfig.cssClass} ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Current slide */}
        <div 
          className={`slide-wrapper slide-active ${
            isTransitioning ? 'slide-exit transitioning' : ''
          }`}
        >
          <div className="slide">
            <MDXRemote 
              {...slides[currentSlide].content} 
              components={{
                ...components,
                Poll: (props: React.ComponentProps<typeof Poll>) => (
                  <Poll 
                    {...props} 
                    presentationShortId={config.shortId}
                    slideNumber={currentSlide + 1}
                  />
                )
              }} 
            />
          </div>
        </div>
        
        {/* Next slide during transition */}
        {isTransitioning && nextSlideIndex !== null && (
          <div className="slide-wrapper slide-enter transitioning slide-enter-active">
            <div className="slide">
              <MDXRemote 
                {...slides[nextSlideIndex].content} 
                components={{
                  ...components,
                  Poll: (props: React.ComponentProps<typeof Poll>) => (
                    <Poll 
                      {...props} 
                      presentationShortId={config.shortId}
                      slideNumber={nextSlideIndex + 1}
                    />
                  )
                }} 
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="nav-controls">
        <button 
          className="nav-button" 
          onClick={prevSlide} 
          disabled={currentSlide === 0 || isTransitioning}
        >
          ← Prev
        </button>
        <div className="nav-center">
          <div className="nav-counter">
            <input
              type="text"
              value={slideInputValue}
              onChange={(e) => setSlideInputValue(e.target.value)}
              onFocus={(e) => {
                e.target.select();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const slideNum = parseInt(slideInputValue, 10);
                  if (slideNum >= 1 && slideNum <= slides.length) {
                    goToSlide(slideNum - 1);
                  }
                }
              }}
              onBlur={() => {
                const slideNum = parseInt(slideInputValue, 10);
                if (slideNum >= 1 && slideNum <= slides.length) {
                  goToSlide(slideNum - 1);
                } else {
                  setSlideInputValue((currentSlide + 1).toString());
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                textAlign: 'center',
                width: `${slideInputValue.length + 1}ch`,
                minWidth: '2ch',
                outline: 'none',
                padding: 0,
                margin: 0
              }}
            />
            <span> / {slides.length}</span>
          </div>
          <button 
            className="nav-button refresh-button" 
            onClick={refreshPolls}
            disabled={!presentationId || loading || refreshing}
            title="Refresh polls from markdown content"
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}
          >
            ↻
          </button>
        </div>
        <button 
          className="nav-button" 
          onClick={nextSlide} 
          disabled={currentSlide === slides.length - 1 || isTransitioning}
        >
          Next →
        </button>
      </div>


      
      {/* Floating QR Code - Bigger on first slide, normal size on others */}
      <FloatingQR 
        presentationShortId={config.shortId} 
        customUrl={config.customUrl}
        isFirstSlide={currentSlide === 0}
        transitionClass={transitionConfig.cssClass}
        isTransitioning={isTransitioning}
      />
    </div>
  );
}

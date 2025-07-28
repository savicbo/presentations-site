'use client';

import React from 'react';

interface VideoProps {
  src: string;
  title?: string;
  aspectRatio?: string;
  maxHeight?: string;
  autoplay?: boolean;
  allowFullscreen?: boolean;
  className?: string;
}

export default function Video({ 
  src, 
  title = "Video", 
  aspectRatio = "56.25%", // 16:9 by default
  maxHeight,
  autoplay = false,
  allowFullscreen = true,
  className = ""
}: VideoProps) {
  // Extract video ID and platform from common video URLs
  const getEmbedUrl = (url: string) => {
    // If it's already an embed URL, return as is
    if (url.includes('player.vimeo.com') || url.includes('youtube.com/embed')) {
      return url;
    }
    
    // Handle Vimeo URLs
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479${autoplay ? '&autoplay=1' : ''}`;
    }
    
    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(src);

  return (
    <iframe
      className={`video-iframe ${className}`}
      src={embedUrl}
      title={title}
      frameBorder="0"
      allow={`autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share${autoplay ? '; autoplay' : ''}`}
      referrerPolicy="strict-origin-when-cross-origin"
      style={{
        width: '100%',
        aspectRatio: aspectRatio === '56.25%' ? '16 / 9' : aspectRatio,
        borderRadius: '8px',
        border: 'none',
        ...(maxHeight && { maxHeight }),
      }}
      allowFullScreen={allowFullscreen}
    />
  );
}

// Convenience components for specific platforms
export function VimeoVideo({ 
  videoId, 
  hash,
  title,
  autoplay = false,
  ...props 
}: { 
  videoId: string; 
  hash?: string; 
  title?: string;
  autoplay?: boolean;
} & Omit<VideoProps, 'src' | 'autoplay'>) {
  const params = new URLSearchParams();
  if (hash) params.append('h', hash);
  params.append('badge', '0');
  params.append('autopause', '0');
  params.append('player_id', '0');
  params.append('app_id', '58479');
  if (autoplay) {
    params.append('autoplay', '1');
    params.append('muted', '1'); // Required for autoplay in most browsers
  }
  
  const src = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  return <Video src={src} title={title} autoplay={autoplay} {...props} />;
}

export function YouTubeVideo({ 
  videoId, 
  title,
  start,
  end,
  controls = true,
  modestbranding = false,
  rel = true,
  showinfo = true,
  loop = false,
  playlist,
  mute = false,
  ...props 
}: { 
  videoId: string; 
  title?: string;
  start?: number; // Start time in seconds
  end?: number; // End time in seconds
  controls?: boolean; // Show player controls
  modestbranding?: boolean; // Modest YouTube branding
  rel?: boolean; // Show related videos
  showinfo?: boolean; // Show video info
  loop?: boolean; // Loop the video
  playlist?: string; // Playlist ID for looping
  mute?: boolean; // Start muted
} & Omit<VideoProps, 'src'>) {
  const params = new URLSearchParams();
  
  if (start !== undefined) params.append('start', start.toString());
  if (end !== undefined) params.append('end', end.toString());
  if (!controls) params.append('controls', '0');
  if (modestbranding) params.append('modestbranding', '1');
  if (!rel) params.append('rel', '0');
  if (!showinfo) params.append('showinfo', '0');
  if (loop) {
    params.append('loop', '1');
    // For loop to work, we need a playlist parameter
    params.append('playlist', playlist || videoId);
  }
  if (mute || props.autoplay) {
    // Mute is required for autoplay in most browsers
    params.append('mute', '1');
  }
  if (props.autoplay) {
    params.append('autoplay', '1');
  }
  
  const queryString = params.toString();
  const src = `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
  
  return <Video src={src} title={title} {...props} />;
}

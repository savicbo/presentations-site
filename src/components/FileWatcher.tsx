'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FileWatcherProps {
  filePath: string;
  interval?: number;
}

export default function FileWatcher({ filePath, interval = 1000 }: FileWatcherProps) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return; // Only watch files in development
    }

    let lastModified: number | null = null;

    const checkFile = async () => {
      try {
        const response = await fetch(`/api/file-watcher?path=${encodeURIComponent(filePath)}`);
        if (response.ok) {
          const { lastModified: newLastModified } = await response.json();
          
          if (lastModified !== null && newLastModified !== lastModified) {
            // File has changed, refresh the page
            router.refresh();
          }
          
          lastModified = newLastModified;
        }
      } catch (error) {
        // Silently ignore errors in development
      }
    };

    // Check immediately
    checkFile();

    // Set up interval
    const intervalId = setInterval(checkFile, interval);

    return () => clearInterval(intervalId);
  }, [filePath, interval, router]);

  return null; // This component doesn't render anything
}

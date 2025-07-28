import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import PresentationViewer from '@/components/PresentationViewer';
import '@/styles/themes/default.css';

interface PresentationConfig {
  title: string;
  theme: string;
  shortId: string;
  slides: Array<{
    id: number;
    title: string;
    content: string;
  }>;
}

async function loadPresentation(slug: string): Promise<{ config: PresentationConfig; slidesContent: string } | null> {
  try {
    const presentationDir = join(process.cwd(), 'presentations', slug);
    
    // Load presentation config
    const configPath = join(presentationDir, 'presentation.json');
    const configContent = await readFile(configPath, 'utf-8');
    const config: PresentationConfig = JSON.parse(configContent);
    
    // Load slides content
    const slidesPath = join(presentationDir, 'slides.mdx');
    const slidesContent = await readFile(slidesPath, 'utf-8');
    
    return { config, slidesContent };
  } catch (error) {
    console.error('Failed to load presentation:', error);
    return null;
  }
}

export default async function PresentationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const presentation = await loadPresentation(slug);
  
  if (!presentation) {
    notFound();
  }
  
  return <PresentationViewer config={presentation.config} slidesContent={presentation.slidesContent} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const presentation = await loadPresentation(slug);
  
  if (!presentation) {
    return {
      title: 'Presentation Not Found',
    };
  }
  
  return {
    title: presentation.config.title,
    description: `Interactive presentation: ${presentation.config.title}`,
  };
}

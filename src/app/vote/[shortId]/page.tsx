import { notFound } from 'next/navigation';
import AudienceView from '@/components/AudienceView';
import { getPresentationByShortId } from '@/lib/presentation-helpers';

export default async function VotePage({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params;
  const presentation = await getPresentationByShortId(shortId);
  
  if (!presentation) {
    notFound();
  }
  
  return <AudienceView presentation={presentation} />;
}

export async function generateMetadata({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params;
  const presentation = await getPresentationByShortId(shortId);
  
  if (!presentation) {
    return {
      title: 'Presentation Not Found',
    };
  }
  
  return {
    title: `${presentation.title} - Vote`,
    description: `Join the live presentation and vote: ${presentation.title}`,
  };
}

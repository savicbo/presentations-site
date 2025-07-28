'use client';

import QRCode from './QRCode';

interface FloatingQRProps {
  presentationShortId: string;
  customUrl?: string;
  isFirstSlide?: boolean;
  transitionClass?: string;
  isTransitioning?: boolean;
}

export default function FloatingQR({ presentationShortId, customUrl, isFirstSlide = false, transitionClass = '', isTransitioning = false }: FloatingQRProps) {
  const displayUrl = customUrl || `vote/${presentationShortId}`;
  const qrUrl = customUrl ? `https://${customUrl}` : `${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${presentationShortId}`;
  
  // Make QR code 3x bigger with more padding on first slide
  const qrSize = isFirstSlide ? 320 : 120;
  const fontSize = isFirstSlide ? '24px' : '16px';
  const padding = isFirstSlide ? 'p-8' : '';
  const positioning = isFirstSlide ? 'fixed top-8 right-8 z-50' : 'fixed top-4 right-4 z-50';
  
  return (
    <div className={`${positioning} qr-transition-container ${transitionClass} ${isTransitioning ? 'transitioning' : ''}`}>
      <div className={`flex flex-col items-center ${padding} qr-content`}>
        <QRCode 
          value={qrUrl}
          size={qrSize}
          fgColor="#ffffff"
          bgColor="transparent"
        />
        <p className="text-white text-s mt-2" style={{ fontSize }}>{displayUrl}</p>
      </div>
    </div>
  );
}

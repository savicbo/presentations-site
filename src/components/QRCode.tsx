'use client';

import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export default function QRCode({ 
  value, 
  size = 300, 
  fgColor = '#00ff00', 
  bgColor = '#0a2950' 
}: QRCodeProps) {
  const [mounted, setMounted] = useState(false);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const qrCodeInstance = new QRCodeStyling({
      width: size,
      height: size,
      type: "canvas",
      shape: "square",
      data: value,
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q"
      },
      imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: false,
        imageSize: 0,
        margin: 0
      },
      dotsOptions: {
        type: "dots",
        color: fgColor || "#ffffff",
        roundSize: true
      },
      backgroundOptions: {
        color: bgColor || "#0a2950"
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: fgColor || "#ffffff"
      },
      cornersDotOptions: {
        color: fgColor || "#ffffff"
      }
    });

    setQrCode(qrCodeInstance);

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCodeInstance.append(ref.current);
    }
  }, [mounted, value, size, fgColor, bgColor]);

  if (!mounted) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          fontFamily: 'Pixelify Sans, monospace'
        }}
      >
        <span style={{ color: fgColor, fontSize: '12px' }}>Loading QR...</span>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      style={{

      }}
    />
  );
}
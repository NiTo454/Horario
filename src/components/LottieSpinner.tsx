'use client';

import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieSpinnerProps {
  size?: number; // Tamaño en píxeles
  className?: string;
}

export default function LottieSpinner({ size = 80, className = '' }: LottieSpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/HEATLH.json', // Carga el archivo lottie desde la carpeta public
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: `${size}px`, height: `${size}px` }} 
      className={`flex items-center justify-center ${className}`}
    />
  );
}

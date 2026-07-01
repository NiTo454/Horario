'use client';

import React, { useEffect, useRef } from 'react';
import healthAnimation from './HEATLH.json';

interface LottieSpinnerProps {
  size?: number; // Tamaño en píxeles
  className?: string;
}

export default function LottieSpinner({ size = 80, className = '' }: LottieSpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let anim: any;

    // Importación dinámica de lottie-web en el cliente para evitar errores de SSR (Server-Side Rendering)
    import('lottie-web').then((lottieModule) => {
      const lottie = lottieModule.default;
      if (!containerRef.current) return;
      
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: healthAnimation,
      });
    });

    return () => {
      if (anim && typeof anim.destroy === 'function') {
        anim.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: `${size}px`, height: `${size}px` }} 
      className={`flex items-center justify-center overflow-hidden ${className}`}
    />
  );
}

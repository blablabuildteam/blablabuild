'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type BubbleBackgroundProps = React.ComponentProps<'div'> & {
  /** RGB values for the blue accent blob */
  blueColor?: string;
  /** RGB values for the volt/lime accent blob */
  voltColor?: string;
  /** Background color (hex or CSS color) */
  backgroundColor?: string;
};

function BubbleBackground({
  className,
  children,
  blueColor = '17,37,255',    // #1125ff
  voltColor = '206,255,0',     // #CEFF00
  backgroundColor = '#070800', // Smoky black
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn(
        'relative size-full overflow-hidden',
        className,
      )}
      style={{ backgroundColor }}
      {...props}
    >
      {/* CSS Keyframe Animations */}
      <style>
        {`
          @keyframes blob-drift-1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(50px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(1.05);
            }
          }
          
          @keyframes blob-drift-2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(-40px, 40px) scale(1.05);
            }
            66% {
              transform: translate(30px, -20px) scale(0.95);
            }
          }
          
          @keyframes blob-drift-3 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(-60px, 30px) scale(1.15);
            }
            66% {
              transform: translate(20px, -40px) scale(1.05);
            }
          }
          
          @keyframes blob-drift-4 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(40px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-30px, 30px) scale(0.95);
            }
          }
          
          .blob-1 {
            animation: blob-drift-1 20s ease-in-out infinite;
          }
          
          .blob-2 {
            animation: blob-drift-2 25s ease-in-out infinite;
          }
          
          .blob-3 {
            animation: blob-drift-3 22s ease-in-out infinite;
          }
          
          .blob-4 {
            animation: blob-drift-4 18s ease-in-out infinite;
          }
        `}
      </style>

      {/* SVG Filter for gooey effect */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-0 h-0"
        aria-hidden="true"
      >
        <defs>
          <filter id="goo-hero">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Animated Gradient Blobs - pointer-events-none to allow scrolling */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'url(#goo-hero) blur(60px)' }}
      >
        {/* Blue Blob - Bottom Left */}
        <div
          className="blob-1 absolute rounded-full mix-blend-screen"
          style={{
            width: '60%',
            height: '60%',
            bottom: '-10%',
            left: '-10%',
            opacity: 0.5,
            background: `radial-gradient(circle at center, rgba(${blueColor}, 0.8) 0%, rgba(${blueColor}, 0) 60%)`,
          }}
        />

        {/* Secondary Blue Blob - More subtle, overlapping */}
        <div
          className="blob-2 absolute rounded-full mix-blend-screen"
          style={{
            width: '50%',
            height: '50%',
            bottom: '5%',
            left: '10%',
            opacity: 0.3,
            background: `radial-gradient(circle at center, rgba(${blueColor}, 0.6) 0%, rgba(${blueColor}, 0) 55%)`,
          }}
        />

        {/* Volt Blob - Right Side */}
        <div
          className="blob-3 absolute rounded-full mix-blend-screen"
          style={{
            width: '55%',
            height: '70%',
            top: '10%',
            right: '-15%',
            opacity: 0.45,
            background: `radial-gradient(circle at center, rgba(${voltColor}, 0.7) 0%, rgba(${voltColor}, 0) 55%)`,
          }}
        />

        {/* Secondary Volt Blob - Smaller accent */}
        <div
          className="blob-4 absolute rounded-full mix-blend-screen"
          style={{
            width: '40%',
            height: '45%',
            top: '30%',
            right: '5%',
            opacity: 0.25,
            background: `radial-gradient(circle at center, rgba(${voltColor}, 0.5) 0%, rgba(${voltColor}, 0) 50%)`,
          }}
        />
      </div>

      {/* Content Layer */}
      {children}
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };

'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';

const founders = [
  {
    name: 'Daniel',
    role: 'Data, tech & AI',
    description: 'Combineert AI consulting, tech en productie kennis om complexiteit te vertalen naar concrete en uitvoerbare kansen met focus op het stroomlijnen organisaties.',
    cardRotation: 3.886,
    cardSkew: 1.267,
  },
  {
    name: 'Kevin',
    role: 'Growth & CX',
    description: 'Combineert strategische visie met hands-on ondernemerschap om schaalbare digitale oplossingen te leveren. Specialisatie ligt in het winnen van de markt door een sterke merkidentiteit en conversiekracht.',
    cardRotation: -4.331,
    cardSkew: -1.411,
  },
  {
    name: 'Xennith',
    role: 'Business Transformation',
    description: 'Combineert AI consulting, tech en productie kennis om complexiteit te vertalen naar concrete en uitvoerbare kansen met focus op het stroomlijnen organisaties.',
    cardRotation: 4.359,
    cardSkew: 1.42,
  },
];

// Canvas-based video frame display for smooth scroll-driven playback
function VideoCanvas({ 
  videoRef, 
  className 
}: { 
  videoRef: React.RefObject<HTMLVideoElement | null>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const drawFrame = () => {
      if (video.readyState >= 2) {
        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1920;
          canvas.height = video.videoHeight || 1080;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ imageRendering: 'auto' }}
    />
  );
}

export default function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Scroll-driven video playback
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || videoDuration === 0) return;

    let ticking = false;
    let lastSetTime = 0;

    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Video starts when section top enters bottom third of viewport
        // This makes it start earlier than waiting for center
        const startTrigger = viewportHeight * 0.7; // Start when section top is at 70% down viewport
        
        // Video ends when section bottom reaches top of viewport
        const scrollRange = rect.height + startTrigger;
        
        // Calculate progress: 0 when section top at startTrigger, 1 when section bottom leaves viewport top
        const distanceScrolled = startTrigger - rect.top;
        const progress = Math.max(0, Math.min(1, distanceScrolled / scrollRange));
        
        // Set video time directly
        const targetTime = progress * videoDuration;
        
        // Only update if section is in/near viewport and time changed enough
        if (rect.bottom > -100 && rect.top < viewportHeight + 100) {
          if (Math.abs(lastSetTime - targetTime) > 0.05) {
            video.currentTime = targetTime;
            lastSetTime = targetTime;
          }
        }
        
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [videoDuration]);

  return (
    <section 
      ref={sectionRef}
      id="team" 
      className="min-h-screen flex flex-col justify-center bg-white px-4 md:px-16 py-16 md:py-24"
    >
      {/* Hidden video element - single source of truth */}
      <video
        ref={videoRef}
        src="/5793002-hd_1920_1080_30fps.mp4"
        className="hidden"
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleVideoLoaded}
      />

      <div className="mx-auto w-full max-w-[1312px]">
        {/* Header */}
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] text-black text-center max-w-[820px] mx-auto leading-tight mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          Dat betekent voor jou senioriteit die de handen uit de mouwen steekt
        </motion.h2>

        {/* Team Cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {founders.map((founder, idx) => (
            <motion.div
              key={founder.name}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6,
                delay: idx * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              {/* Yellow Background Card - Rotated */}
              <div
                className="absolute inset-0 bg-bla-lime rounded-xl -z-10"
                style={{
                  transform: `rotate(${founder.cardRotation}deg) skewX(${founder.cardSkew}deg)`,
                  top: '-12px',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-12px',
                }}
              />

              {/* Canvas displaying video frame - all show same frame */}
              <div className="aspect-[416/529] w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
                <VideoCanvas 
                  videoRef={videoRef} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="mt-6">
                <h3 className="font-host font-bold text-lg md:text-xl text-black">
                  {founder.name}
                </h3>
                <p className="font-host font-normal text-lg md:text-xl text-bla-blue mb-4">
                  {founder.role}
                </p>
                <p className="font-host font-normal text-sm md:text-base text-[#85867f] leading-relaxed">
                  {founder.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

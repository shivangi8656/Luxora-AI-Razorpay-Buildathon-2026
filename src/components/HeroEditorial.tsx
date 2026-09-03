import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Compass, Tag, Check, Zap, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMerchant } from '../context/MerchantContext';

interface HeroEditorialProps {
  onExploreCollection: () => void;
  onOpenAtelier: () => void;
  onOpenLookbook: () => void;
  onApplyPromoCode?: (code: string) => void;
}

export const HeroEditorial: React.FC<HeroEditorialProps> = ({
  onExploreCollection,
  onOpenAtelier,
  onOpenLookbook,
  onApplyPromoCode,
}) => {
  const { activeCampaigns } = useMerchant();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const bannerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 28, stiffness: 90, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 90, mass: 0.5 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      if (videoRef.current) {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.catch(() => {
            // Autoplay may wait for user interaction in certain browsers
          });
        }
      }
    };

    playVideo();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleUnlock = () => {
      playVideo();
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('scroll', handleUnlock);
    };

    window.addEventListener('click', handleUnlock, { passive: true });
    window.addEventListener('touchstart', handleUnlock, { passive: true });
    window.addEventListener('scroll', handleUnlock, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('scroll', handleUnlock);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    const el = bannerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const clampedX = Math.max(-1, Math.min(1, normX));
    const clampedY = Math.max(-1, Math.min(1, normY));
    // Opposite direction parallax
    mouseX.set(-clampedX * 18);
    mouseY.set(-clampedY * 12);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyPromoCode) {
      onApplyPromoCode(code);
    }
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const primaryCampaign = activeCampaigns && activeCampaigns.length > 0 ? activeCampaigns[0] : null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative pt-24 sm:pt-28 md:pt-32 pb-6 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16 space-y-4">
        
        {/* Buyer Storefront Hero Banner with Full Haute Couture Video Coverage */}
        <div 
          ref={bannerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[500px] bg-[#ffffff] border border-[#e4e2dd] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs flex flex-col justify-center"
        >
          
          {/* Background Video Layer with Parallax Depth */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-neutral-950">
            <motion.div
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1.10 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: prefersReducedMotion ? 0 : springX,
                y: prefersReducedMotion ? 0 : springY,
              }}
              className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] transform-gpu will-change-transform"
            >
              {!videoError ? (
                <video
                  ref={videoRef}
                  id="curated-intelligence-video"
                  src="/videos/2nd_page.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  preload="auto"
                  poster="/videos/second_page_poster.jpg"
                  onLoadedData={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  onCanPlay={() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  onError={(e) => {
                    console.warn('Hero editorial video fallback notice:', e);
                    if (videoRef.current?.error) {
                      setVideoError(true);
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                >
                  <source src="/videos/2nd_page.mp4" type="video/mp4" />
                  <source src="/videos/2nd%20page.mp4" type="video/mp4" />
                  <source src="/videos/fashion_runway.mp4" type="video/mp4" />
                  <source src="/videos/fashion_runway.mp4.mp4" type="video/mp4" />
                </video>
              ) : (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-[#1b1c19]" 
                  style={{ backgroundImage: `url('/videos/second_page_poster.jpg')` }}
                />
              )}
            </motion.div>
            
            {/* Subtle scrim for crystal-clear video presentation and effortless legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent w-full md:w-1/2 pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-black/[0.02] pointer-events-none z-[1]" />
          </div>

          {/* Foreground Content - Relative positioning with z-10 */}
          <div className="relative z-10 p-5 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl space-y-3.5 bg-white/60 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200/60 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#fc6018] animate-ping" />
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#a83900] font-bold">
                  Autonomous Personal Styling
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-950 font-sans leading-[1.08] text-balance">
                Curated Intelligence.
              </h1>
              <p className="text-neutral-900 text-sm sm:text-base leading-relaxed font-medium max-w-lg drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                Discover your personal aesthetic through conversational AI. Tell Luxora what you need, and we will tailor the atelier to your style in real time.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAtelier}
                className="px-8 py-4 bg-black text-white font-semibold text-sm rounded-full hover:bg-[#a83900] transition-all duration-300 shadow-md flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>ASK LUXORA</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenLookbook}
                className="px-7 py-4 bg-white/85 backdrop-blur-md border border-[#747878]/30 text-black font-semibold text-sm rounded-full hover:border-black hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Compass className="w-4 h-4" />
                <span>Lookbook</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Atmospheric background accent */}
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#f5f3ee] rounded-full blur-3xl z-0 opacity-40 pointer-events-none" />
        </div>

      </div>
    </motion.section>
  );
};


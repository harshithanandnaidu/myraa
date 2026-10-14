import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { birthdayAudio } from '../utils/audio';
import { Sparkles, Heart, Flame, RefreshCw } from 'lucide-react';

interface BirthdayCakeProps {
  name?: string;
  onClose?: () => void;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({ name = 'Myraa', onClose }) => {
  const [candleLit, setCandleLit] = useState<boolean>(true);
  const [wishMade, setWishMade] = useState<boolean>(false);
  const [customWish, setCustomWish] = useState<string>('');
  const [wishRevealed, setWishRevealed] = useState<boolean>(false);

  const handleBlowCandle = () => {
    if (!candleLit) return;
    setCandleLit(false);
    setWishMade(true);

    // Audio celebration
    birthdayAudio.playCelebrationFanfare();

    // Spectacular multi-stage confetti
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      // Confetti with gold, pink, coral, red colors
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
        colors: ['#ff4b72', '#ffd166', '#ff758c', '#ffbe0b', '#ffffff'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
        colors: ['#f72585', '#ff9a76', '#ffa07a', '#ffea79', '#f8b4d9'],
      });
    }, 250);

    setTimeout(() => {
      setWishRevealed(true);
    }, 800);
  };

  const handleRelight = () => {
    setCandleLit(true);
    setWishMade(false);
    setWishRevealed(false);
    birthdayAudio.playChime(587.33, 0.8);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto p-6 sm:p-8 bg-gradient-to-b from-pink-950/60 to-black/90 rounded-3xl border border-pink-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(255,75,114,0.25)] text-center text-white">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold mb-3 tracking-wider uppercase">
        <Sparkles size={14} className="text-yellow-400" />
        Birthday Wish Ritual
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold font-body text-white mb-2">
        Make a Birthday Wish, {name}! 🎂✨
      </h2>
      <p className="text-pink-200/80 text-sm max-w-md mx-auto mb-6">
        Close your eyes, think of the sweetest wish in your heart, and blow out the candle!
      </p>

      {/* 3D-Styled Birthday Cake with Candle */}
      <div className="relative my-8 flex flex-col items-center justify-center">
        {/* Candle */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Flame & Glow */}
          {candleLit ? (
            <div
              onClick={handleBlowCandle}
              className="cursor-pointer group relative flex flex-col items-center -mb-1 animate-pulse"
              title="Click or tap to blow the flame!"
            >
              <div className="w-6 h-9 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_25px_#ff9a00,0_0_50px_#ff5e00] transform -rotate-2 hover:scale-110 transition-transform"></div>
              {/* Flame wick */}
              <div className="w-0.5 h-3 bg-gray-900 mt-0.5"></div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center -mb-1">
              {/* Smoke curl */}
              <div className="text-xs text-white/50 animate-bounce -mt-4 font-mono">~ ☁️ ~</div>
              <div className="w-0.5 h-3 bg-gray-800"></div>
            </div>
          )}

          {/* Candle Body */}
          <div className="w-4 h-14 bg-gradient-to-r from-pink-300 via-white to-pink-300 rounded-t-sm shadow-md border-x border-pink-400/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,105,180,0.5) 4px, rgba(255,105,180,0.5) 8px)"></div>
          </div>
        </div>

        {/* Top Cake Tier */}
        <div className="relative -mt-1 w-36 sm:w-44 h-14 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 rounded-t-2xl shadow-lg border-t-2 border-white/60 flex items-center justify-center">
          {/* Frosting drips */}
          <div className="absolute -bottom-2 w-full flex justify-around px-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-rose-200 rounded-full shadow-inner transform -translate-y-1"
              ></div>
            ))}
          </div>
          {/* Sugar Pearls */}
          <div className="flex gap-2">
            <span className="text-xs">🍓</span>
            <span className="text-xs">✨</span>
            <span className="text-xs">🍓</span>
          </div>
        </div>

        {/* Bottom Cake Tier */}
        <div className="relative -mt-1 w-52 sm:w-60 h-20 bg-gradient-to-r from-pink-500 via-pink-400 to-rose-500 rounded-t-3xl shadow-2xl border-t-2 border-white/40 flex flex-col items-center justify-center">
          {/* Gold plate shine */}
          <div className="text-xs sm:text-sm font-handwriting text-white/95 font-bold tracking-widest drop-shadow-md">
            Happy Birthday {name} ❤️
          </div>
          <div className="flex gap-2.5 mt-1">
            <Heart size={12} className="text-pink-200 fill-pink-200 animate-ping" />
            <Heart size={14} className="text-yellow-200 fill-yellow-200" />
            <Heart size={12} className="text-pink-200 fill-pink-200" />
          </div>
        </div>

        {/* Golden Cake Stand */}
        <div className="w-64 sm:w-72 h-4 bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 rounded-full shadow-[0_5px_20px_rgba(251,191,36,0.4)] mt-0.5"></div>
      </div>

      {/* Blow Candle Action Button */}
      {candleLit ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleBlowCandle}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-base shadow-[0_0_30px_rgba(244,63,94,0.6)] active:scale-95 transition flex items-center gap-2 group"
          >
            <Flame className="group-hover:animate-bounce text-yellow-200" size={18} />
            <span>Tap to Blow the Candle 🌬️🕯️</span>
          </button>
          <span className="text-xs text-white/50">or click directly on the flame</span>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-white/10 border border-pink-400/40 text-pink-100 backdrop-blur-md">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
              ✨ Wish Granted into the Stars ✨
            </p>
            <p className="text-lg font-handwriting text-white text-shadow leading-relaxed">
              &ldquo;May every smile you give come back to you ten times brighter. May all your dreams, {name}, bloom into reality!&rdquo;
            </p>
          </div>

          <button
            onClick={handleRelight}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs text-pink-200 border border-white/20 transition"
          >
            <RefreshCw size={12} />
            <span>Relight the Candle 🕯️</span>
          </button>
        </div>
      )}
    </div>
  );
};

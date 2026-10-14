import React, { useState, useEffect, useRef } from 'react';
import { birthdayAudio } from '../utils/audio';
import { Sparkles, Send, Flame } from 'lucide-react';

interface SkyWishLanternsProps {
  name?: string;
}

interface ActiveLantern {
  id: number;
  message: string;
  sender: string;
  x: number; // percentage from 10 to 90
  y: number; // percentage from 100 to -20
  speed: number;
  size: number;
  swayPhase: number;
  glow: string;
}

export const SkyWishLanterns: React.FC<SkyWishLanternsProps> = ({ name = 'Myraa' }) => {
  const [lanterns, setLanterns] = useState<ActiveLantern[]>([
    {
      id: 1,
      message: `May you smile every single day, ${name}! ✨`,
      sender: 'Secret Admirer',
      x: 25,
      y: 40,
      speed: 0.05,
      size: 48,
      swayPhase: 1.2,
      glow: '#ffa07a',
    },
    {
      id: 2,
      message: `To endless laughter and big dreams coming true! 🌟`,
      sender: 'Bestie',
      x: 75,
      y: 20,
      speed: 0.045,
      size: 42,
      swayPhase: 2.5,
      glow: '#ffd166',
    },
    {
      id: 3,
      message: `Wishing you all the happiness in the universe 💕`,
      sender: 'With Love',
      x: 50,
      y: 65,
      speed: 0.06,
      size: 52,
      swayPhase: 0.8,
      glow: '#ff758c',
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const presets = [
    `May this year be your happiest and most successful yet! 🌟`,
    `Never stop smiling, because your smile heals everything. ❤️`,
    `May you always be surrounded by love, warmth, and peace. 🌸`,
    `Keep shining brightly, the world is lucky to have you! ✨`,
  ];

  // Upward floating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLanterns((prev) =>
        prev
          .map((l) => ({
            ...l,
            y: l.y - l.speed * 4,
            swayPhase: l.swayPhase + 0.05,
          }))
          .filter((l) => l.y > -25)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSendLantern = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = inputMessage.trim() || selectedPreset || `Happy Birthday ${name}! ❤️`;

    birthdayAudio.playCelebrationFanfare();

    const glows = ['#ffa07a', '#ffd166', '#ff758c', '#ffbe0b', '#f72585'];
    const newLantern: ActiveLantern = {
      id: Date.now(),
      message: finalMsg,
      sender: senderName.trim() || 'Someone who loves you',
      x: 20 + Math.random() * 60,
      y: 95,
      speed: 0.04 + Math.random() * 0.03,
      size: 48 + Math.random() * 12,
      swayPhase: Math.random() * Math.PI * 2,
      glow: glows[Math.floor(Math.random() * glows.length)],
    };

    setLanterns((prev) => [...prev, newLantern]);
    setInputMessage('');
    setSelectedPreset('');
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 overflow-hidden">
      {/* Lantern Sky Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-b from-[#050109] via-[#120414] to-[#1f061e] border border-pink-500/30 overflow-hidden shadow-[0_0_50px_rgba(255,75,114,0.15)] flex flex-col justify-between p-4 sm:p-6">
        {/* Subtle background stars */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                top: `${(i * 19) % 100}%`,
                left: `${(i * 27) % 100}%`,
                animationDuration: `${2 + (i % 4)}s`,
                animationDelay: `${(i % 3) * 0.8}s`,
                opacity: 0.3 + (i % 5) * 0.15,
              }}
            />
          ))}
        </div>

        {/* Sky Title */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame size={12} className="text-amber-400" />
            Celestial Lantern Sky
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-body text-white">
            Floating Wishes for {name} 🏮✨
          </h3>
          <p className="text-xs text-pink-200/70">
            Hover over floating lanterns to read the birthday blessings
          </p>
        </div>

        {/* Floating Lanterns Render */}
        <div className="absolute inset-0 pointer-events-auto">
          {lanterns.map((l) => {
            const sway = Math.sin(l.swayPhase) * 15;
            return (
              <div
                key={l.id}
                className="absolute transform -translate-x-1/2 cursor-pointer group"
                style={{
                  left: `calc(${l.x}% + ${sway}px)`,
                  top: `${l.y}%`,
                  transition: 'top 0.05s linear',
                }}
              >
                {/* Glowing Lantern Graphic */}
                <div
                  className="relative flex flex-col items-center animate-pulse"
                  style={{
                    filter: `drop-shadow(0 0 16px ${l.glow})`,
                  }}
                >
                  <div
                    className="rounded-xl border border-amber-200/60 flex items-center justify-center relative overflow-hidden"
                    style={{
                      width: `${l.size}px`,
                      height: `${l.size * 1.3}px`,
                      background: `linear-gradient(to bottom, #fff5eb, ${l.glow}, #e63946)`,
                    }}
                  >
                    {/* Inner flame */}
                    <div className="w-3 h-4 rounded-full bg-amber-100 shadow-[0_0_10px_#ffbe0b] animate-bounce"></div>
                  </div>
                  {/* Tassel line */}
                  <div className="w-0.5 h-3 bg-amber-300/80"></div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-black/90 border border-pink-400/50 backdrop-blur-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                  <p className="font-caveat text-sm text-pink-200 leading-snug">
                    &ldquo;{l.message}&rdquo;
                  </p>
                  <span className="text-[10px] text-pink-400/80 block text-right mt-1 font-mono">
                    — {l.sender}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 text-center text-[11px] text-pink-300/50 font-caveat text-sm">
          🏮 Lanterns carry your love up into the cosmos
        </div>
      </div>

      {/* Preset Wish Buttons */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setInputMessage(p);
              setSelectedPreset(p);
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-pink-500/20 text-pink-200 text-xs transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Lantern Wish Form */}
      <form onSubmit={handleSendLantern} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
        <input
          type="text"
          placeholder={`Type a personal wish for ${name}...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-pink-500/30 text-white placeholder-pink-300/40 text-sm focus:outline-none focus:border-pink-400"
        />
        <input
          type="text"
          placeholder="Your name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-white/10 border border-pink-500/30 text-white placeholder-pink-300/40 text-sm focus:outline-none focus:border-pink-400"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          <Send size={14} />
          <span>Release 🏮</span>
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { birthdayAudio } from '../utils/audio';
import { Heart, Edit3, Check, Copy, Sparkles, X } from 'lucide-react';

interface LoveLetterModalProps {
  name?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LoveLetterModal: React.FC<LoveLetterModalProps> = ({
  name = 'Myraa',
  isOpen,
  onClose,
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const defaultMessage = `Dearest ${name},

From the moment you stepped into this world, you made it infinitely softer, warmer, and brighter. 

Your laugh is like pure sunshine after a long rain, and the kindness in your eyes could calm the stormiest day. Watching you grow, dream, and conquer every single day is nothing short of pure magic.

On your birthday today, I want to remind you that you are deeply cherished, endlessly admired, and loved beyond measure. Never doubt how rare and irreplaceable you are.

May this new year bring you everything your beautiful heart has ever wished for — effortless joy, spontaneous adventures, peaceful mornings, and endless love.

Happy Birthday, our brightest star. Keep shining like only you can. ✨

With all my love, always. ❤️`;

  const [message, setMessage] = useState<string>(defaultMessage);
  const [displayedText, setDisplayedText] = useState<string>('');

  // Typewriter effect when opened
  useEffect(() => {
    if (!isOpen) {
      setIsOpened(false);
      setDisplayedText('');
      return;
    }
    if (isOpened && !isEditing) {
      let index = 0;
      setDisplayedText('');
      const interval = setInterval(() => {
        if (index <= message.length) {
          setDisplayedText(message.slice(0, index));
          index += 2; // slightly faster typewriter
        } else {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [isOpen, isOpened, isEditing, message]);

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    birthdayAudio.playChime(783.99, 1.2);
    setIsOpened(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1b0a14] to-[#0a0307] rounded-3xl border border-pink-500/40 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(255,75,114,0.3)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-20"
        >
          <X size={20} />
        </button>

        {!isOpened ? (
          /* Sealed Envelope View */
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
            <div className="relative group cursor-pointer" onClick={handleOpenEnvelope}>
              {/* Envelope Body */}
              <div className="w-64 sm:w-80 h-44 sm:h-52 bg-gradient-to-br from-pink-800 via-rose-900 to-pink-950 rounded-2xl border-2 border-pink-400/50 shadow-2xl relative flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                {/* Envelope Flap Lines */}
                <div className="absolute top-0 left-0 right-0 h-24 border-b-2 border-pink-400/30 transform rotate-1 bg-pink-700/30"></div>
                
                {/* Wax Seal */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 border-2 border-amber-300 shadow-[0_0_20px_rgba(220,38,38,0.7)] flex flex-col items-center justify-center animate-heart-pulse">
                  <span className="font-handwriting font-bold text-2xl text-amber-200">M</span>
                  <Heart size={10} className="text-amber-200 fill-amber-200 -mt-1" />
                </div>

                <div className="absolute bottom-3 text-xs font-caveat text-pink-200/90 tracking-widest uppercase">
                  For: {name} • Top Secret 💕
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold font-body text-pink-200">
                A Letter Just For You, {name} 💌
              </h3>
              <p className="text-sm text-pink-300/70 mt-1 font-caveat text-base">
                Tap the sealed envelope to break the wax seal & read the letter
              </p>
            </div>

            <button
              onClick={handleOpenEnvelope}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-sm shadow-lg shadow-pink-500/30 transition active:scale-95"
            >
              Open Envelope ✉️
            </button>
          </div>
        ) : (
          /* Unfolded Parchment Letter View */
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-pink-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-pink-400 fill-pink-400" />
                <span className="font-body font-semibold text-pink-200 text-sm tracking-wide">
                  Birthday Letter to {name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-pink-200 flex items-center gap-1.5 transition"
                >
                  {isEditing ? <Check size={12} /> : <Edit3 size={12} />}
                  <span>{isEditing ? 'Done Editing' : 'Customize'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-pink-200 flex items-center gap-1.5 transition"
                >
                  <Copy size={12} />
                  <span>{copied ? 'Copied! ❤️' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Letter Parchment */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#2a1220] to-[#1c0814] border border-pink-400/30 shadow-inner">
              {isEditing ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-80 bg-transparent text-pink-100 font-caveat text-xl sm:text-2xl leading-relaxed focus:outline-none resize-none"
                  placeholder="Write your personal birthday words for Myraa..."
                />
              ) : (
                <div className="whitespace-pre-wrap font-caveat text-xl sm:text-2xl leading-relaxed text-pink-100/95">
                  {displayedText}
                  {displayedText.length < message.length && (
                    <span className="inline-block w-2 h-5 bg-pink-400 animate-pulse ml-1 align-middle"></span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-pink-300/60 pt-2 font-caveat text-base">
              <span>Wrapped with all the love in the universe ✨</span>
              <span>Made with ❤️ for {name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

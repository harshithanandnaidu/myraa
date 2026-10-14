/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeartTreeCanvas } from './components/HeartTreeCanvas';
import { BirthdayCake } from './components/BirthdayCake';
import { LoveLetterModal } from './components/LoveLetterModal';
import { ReasonCards } from './components/ReasonCards';
import { SkyWishLanterns } from './components/SkyWishLanterns';
import { Heart, Sparkles, Cake, Mail, Flame, Share2 } from 'lucide-react';

export default function App() {
  const [name, setName] = useState<string>('Myraa');
  const [activeTab, setActiveTab] = useState<'tree' | 'cake' | 'reasons' | 'lanterns'>('tree');
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [isCakeModalOpen, setIsCakeModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pov:) It's ${name}'s Birthday ❤️`,
        text: `A special birthday heart tree for ${name} 💕`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white font-body relative overflow-x-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-pink-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center shadow-[0_0_12px_rgba(255,75,114,0.6)]">
            <Heart size={16} className="text-white fill-white animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="w-28 px-2 py-0.5 text-sm bg-pink-950/80 border border-pink-400 rounded text-white focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                title="Click to change name"
                className="font-bold text-sm sm:text-base text-pink-100 hover:text-white flex items-center gap-1 group"
              >
                <span>For: {name}</span>
                <span className="text-[10px] text-pink-400/80 group-hover:text-pink-300">✎</span>
              </button>
            )}
            <span className="hidden sm:inline text-xs text-pink-400/70">• Birthday Edition 🎂</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-pink-200/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles size={13} />
            <span className="hidden xs:inline">Heart Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('cake')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'cake'
                ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-pink-200/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Cake size={13} />
            <span>Cake</span>
          </button>

          <button
            onClick={() => setIsLetterOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 text-pink-200/70 hover:text-white hover:bg-white/10"
          >
            <Mail size={13} />
            <span>Letter 💌</span>
          </button>

          <button
            onClick={() => setActiveTab('reasons')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'reasons'
                ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-pink-200/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart size={13} />
            <span className="hidden sm:inline">Reasons</span>
          </button>

          <button
            onClick={() => setActiveTab('lanterns')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'lanterns'
                ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-pink-200/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame size={13} />
            <span className="hidden sm:inline">Lanterns</span>
          </button>
        </nav>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-white/10 text-pink-200 hover:text-white transition"
          title="Share website link"
        >
          <Share2 size={16} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'tree' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-53px)]">
            <HeartTreeCanvas
              name={name}
              onOpenLetter={() => setIsLetterOpen(true)}
              onOpenCake={() => setActiveTab('cake')}
              onOpenWishes={() => setActiveTab('lanterns')}
            />
          </div>
        )}

        {activeTab === 'cake' && (
          <div className="flex-1 flex items-center justify-center p-4 py-8">
            <BirthdayCake name={name} onClose={() => setActiveTab('tree')} />
          </div>
        )}

        {activeTab === 'reasons' && (
          <div className="flex-1">
            <ReasonCards name={name} />
          </div>
        )}

        {activeTab === 'lanterns' && (
          <div className="flex-1">
            <SkyWishLanterns name={name} />
          </div>
        )}
      </main>

      {/* Love Letter Modal (Triggerable anywhere) */}
      <LoveLetterModal
        name={name}
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
      />

      {/* Copied notification toast */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-50 bg-pink-600 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-pink-400 animate-bounce">
          Link copied to clipboard! Share with {name} 💕
        </div>
      )}
    </div>
  );
}

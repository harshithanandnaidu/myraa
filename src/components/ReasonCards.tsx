import React, { useState } from 'react';
import { birthdayAudio } from '../utils/audio';
import { Heart, Sparkles, Plus, Smile } from 'lucide-react';

interface ReasonCardsProps {
  name?: string;
}

export const ReasonCards: React.FC<ReasonCardsProps> = ({ name = 'Myraa' }) => {
  const initialReasons = [
    {
      id: 1,
      title: 'Your Radiant Smile',
      desc: 'How your eyes crinkle when you genuinely laugh, lighting up the entire room effortlessly.',
      tag: 'Sunshine',
      color: 'from-amber-500/20 to-pink-500/20 border-amber-500/30',
      icon: '✨',
    },
    {
      id: 2,
      title: 'A Heart of Gold',
      desc: 'The instinctive kindness you show to everyone around you, always making people feel safe and loved.',
      tag: 'Pure Soul',
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      icon: '💖',
    },
    {
      id: 3,
      title: 'Your Cute Quirks',
      desc: 'The adorable little expressions and funny little dances you do when you are excited or eating good food!',
      tag: 'Adorable',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      icon: '🌸',
    },
    {
      id: 4,
      title: 'The Best Listener',
      desc: 'How you pay attention to the smallest details and remember things that matter to the people you love.',
      tag: 'Precious',
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30',
      icon: '👂',
    },
    {
      id: 5,
      title: 'Quiet Strength',
      desc: 'The courage and grace with which you handle tough days, always finding a reason to keep moving forward.',
      tag: 'Inspiring',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      icon: '🌿',
    },
    {
      id: 6,
      title: 'Simply Being You',
      desc: 'There is only one Myraa in this vast universe, and that alone makes every single day a whole lot better.',
      tag: 'Irreplaceable',
      color: 'from-pink-500/30 to-violet-500/20 border-pink-500/40',
      icon: '👑',
    },
  ];

  const [reasons, setReasons] = useState(initialReasons);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [likedCards, setLikedCards] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    birthdayAudio.playHeartPop();
    setLikedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    birthdayAudio.playCelebrationFanfare();
    const newReason = {
      id: Date.now(),
      title: newTitle.trim(),
      desc: newDesc.trim(),
      tag: 'Special',
      color: 'from-pink-600/30 to-amber-600/20 border-pink-400/40',
      icon: '💌',
    };
    setReasons([newReason, ...reasons]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
          <Heart size={13} className="text-pink-400 fill-pink-400" />
          <span>Little Reminders</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-body text-white">
          Reasons Why {name} Is So Special 🌸
        </h2>
        <p className="text-pink-200/70 text-sm mt-1 max-w-md mx-auto font-caveat text-lg">
          Just a few of the million reasons everyone adores you
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reasons.map((r) => (
          <div
            key={r.id}
            onClick={() => toggleLike(r.id)}
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${r.color} backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,75,114,0.25)] cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{r.icon}</span>
              <span className="text-[11px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-pink-200">
                {r.tag}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-pink-200 transition-colors">
              {r.title}
            </h3>

            <p className="text-sm text-pink-100/80 mt-2 leading-relaxed font-body">
              {r.desc}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-caveat text-pink-300/80">Tap to send a heart</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(r.id);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition"
              >
                <Heart
                  size={16}
                  className={`transition-all duration-200 ${
                    likedCards[r.id]
                      ? 'text-red-500 fill-red-500 scale-125'
                      : 'text-white/40 hover:text-pink-300'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Reason */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-900/40 hover:bg-pink-800/60 border border-pink-400/40 text-pink-200 text-xs sm:text-sm font-medium transition active:scale-95 backdrop-blur-md"
        >
          <Plus size={16} />
          <span>Add Another Reason for {name} ✨</span>
        </button>
      </div>

      {/* Add Reason Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#220c1a] to-[#12040d] border border-pink-500/40 p-6 rounded-3xl text-white shadow-2xl">
            <h3 className="text-lg font-bold text-pink-200 mb-1">
              Add a sweet note for {name}
            </h3>
            <p className="text-xs text-pink-300/70 mb-4">
              Write a personalized compliment or memory
            </p>

            <form onSubmit={handleAddReason} className="space-y-3">
              <div>
                <label className="text-xs text-pink-200/80 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your Infectious Laughter"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-pink-500/30 text-white placeholder-pink-300/40 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="text-xs text-pink-200/80 block mb-1">Reason / Memory</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What makes Myraa so unforgettable?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-pink-500/30 text-white placeholder-pink-300/40 text-sm focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs shadow-md transition"
                >
                  Post Reason 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

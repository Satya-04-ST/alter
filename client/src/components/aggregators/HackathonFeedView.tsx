'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Trophy,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  Search,
  Flame,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  host: string;
  prizePool: string;
  deadline: string;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'HACKING';
  tags: string[];
  url: string;
  location: string;
  description: string;
}

export function HackathonFeedView() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHackathons() {
      try {
        const res = await api.get('/aggregators/hackathons');
        if (res.data.success) {
          setHackathons(res.data.hackathons);
        }
      } catch (err) {
        console.error('Failed to fetch hackathons:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHackathons();
  }, []);

  const filteredHackathons = hackathons.filter((h) => {
    const q = searchTerm.toLowerCase();
    return (
      h.title.toLowerCase().includes(q) ||
      h.host.toLowerCase().includes(q) ||
      h.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-void-900/70 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Student Hackathons & Research Grants Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Curated Feeds
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Discover prestigious competitions, MLH tournaments, and grant bounties aligned with your curriculum skills
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-cyan-400 bg-void-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Over $550K+ in Active Bounties</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter hackathons by skill tag (e.g. Distributed Systems, Robotics, AI Agents)..."
            className="w-full pl-10 pr-4 py-2.5 bg-void-950 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Feed Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          Fetching Hackathon Feeds...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHackathons.map((hack) => (
            <div
              key={hack.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 bg-void-950/70 space-y-3.5 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {hack.host}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {hack.title}
                    </h4>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold whitespace-nowrap">
                    {hack.prizePool}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {hack.description}
                </p>
              </div>

              {/* Tags and Location */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {hack.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-void-900 text-slate-400 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {formatDate(hack.deadline)}
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      {hack.location}
                    </span>
                  </div>

                  <a
                    href={hack.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold group-hover:underline"
                  >
                    <span>Apply / View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

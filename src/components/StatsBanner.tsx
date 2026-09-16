import React from 'react';
import { TrendingUp, Users, CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react';

export const StatsBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        
        <div className="space-y-1 text-center sm:text-left px-2">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Orders</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            15,482,910+
          </div>
          <span className="text-[11px] text-slate-500 block">Automated fulfillment</span>
        </div>

        <div className="space-y-1 text-center sm:text-left px-2 pt-3 md:pt-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Active Resellers</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            85,420+
          </div>
          <span className="text-[11px] text-slate-500 block">Across 140+ countries</span>
        </div>

        <div className="space-y-1 text-center sm:text-left px-2 pt-3 md:pt-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Avg. Start Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            45 Secs
          </div>
          <span className="text-[11px] text-slate-500 block">High-speed server cluster</span>
        </div>

        <div className="space-y-1 text-center sm:text-left px-2 pt-3 md:pt-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Active Services</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            2,500+
          </div>
          <span className="text-[11px] text-slate-500 block">TikTok, IG, YT, TG, X & more</span>
        </div>

      </div>
    </div>
  );
};

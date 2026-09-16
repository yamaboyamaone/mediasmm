import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ExternalLink, 
  Check, 
  Clock, 
  Zap, 
  ShieldCheck, 
  X, 
  Flame, 
  Tag, 
  Layers, 
  ArrowUpDown
} from 'lucide-react';
import { SmmService, PlatformType, Currency, ServiceBadge } from '../types';
import { SMM_SERVICES, CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';
import { PlatformIcon, getPlatformName } from './PlatformIcon';

interface ServicesTableProps {
  currency: Currency;
  onSelectServiceForOrder: (serviceId: number) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  currency,
  onSelectServiceForOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'price-asc' | 'price-desc'>('id');
  const [activeModalService, setActiveModalService] = useState<SmmService | null>(null);

  const curConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;

  const platforms: { id: PlatformType; label: string }[] = [
    { id: 'all', label: 'All Services' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'applemusic', label: 'Apple Music' },
    { id: 'audiomack', label: 'Audiomack' },
    { id: 'boomplay', label: 'Boomplay' },
    { id: 'soundcloud', label: 'SoundCloud' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'twitter', label: 'X (Twitter)' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'threads', label: 'Threads' },
    { id: 'discord', label: 'Discord' },
  ];

  const badges: { id: string; label: string }[] = [
    { id: 'all', label: 'All Badges' },
    { id: 'BESTSELLER', label: 'Bestseller' },
    { id: 'NON-DROP', label: 'Non-Drop' },
    { id: 'CHEAPEST', label: 'Cheapest' },
    { id: 'HOT', label: 'Hot / Viral' },
    { id: 'INSTANT', label: 'Instant' },
  ];

  const filteredServices = useMemo(() => {
    return SMM_SERVICES.filter(service => {
      // Platform filter
      if (selectedPlatform !== 'all' && service.platform !== selectedPlatform) {
        return false;
      }
      // Badge filter
      if (selectedBadge !== 'all' && service.badge !== selectedBadge) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesCategory = service.category.toLowerCase().includes(q);
        const matchesId = service.id.toString().includes(q);
        if (!matchesName && !matchesCategory && !matchesId) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.ratePer1000 - b.ratePer1000;
      if (sortBy === 'price-desc') return b.ratePer1000 - a.ratePer1000;
      return a.id - b.id;
    });
  }, [searchQuery, selectedPlatform, selectedBadge, sortBy]);

  const renderBadge = (badge?: ServiceBadge) => {
    if (!badge) return null;
    switch (badge) {
      case 'BESTSELLER':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">BESTSELLER</span>;
      case 'NON-DROP':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">NON-DROP</span>;
      case 'CHEAPEST':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">CHEAPEST</span>;
      case 'HOT':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT 🔥</span>;
      case 'INSTANT':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">INSTANT ⚡</span>;
      case 'EXCLUSIVE':
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">EXCLUSIVE ⭐</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">{badge}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Catalog Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Services & Wholesale Rates</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse our catalog of {SMM_SERVICES.length}+ genuine social media growth services. Instant delivery with automated refill.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Services:</span>
          <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
            {filteredServices.length} Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="services-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Service Name, ID, or Keyword..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="id">Sort: Default ID (Asc)</option>
              <option value="price-asc">Sort: Price (Lowest First)</option>
              <option value="price-desc">Sort: Price (Highest First)</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {badges.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Platform Horizontal Scroll Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {platforms.map(p => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {p.id !== 'all' && <PlatformIcon platform={p.id} className="w-3.5 h-3.5" />}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="services-main-table">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4 w-28 text-right">Rate / 1k</th>
                <th className="py-3 px-4 w-28 text-center">Min / Max</th>
                <th className="py-3 px-4 w-32 hidden md:table-cell">Avg Speed</th>
                <th className="py-3 px-4 w-32 hidden lg:table-cell">Guarantee</th>
                <th className="py-3 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No services match your search or selected filter.
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => {
                  const convertedRateFormatted = formatCurrencyAmount(service.ratePer1000, currency);
                  return (
                    <tr 
                      key={service.id} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        #{service.id}
                      </td>

                      {/* Service Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={service.platform} className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                              {service.category}
                            </span>
                            {renderBadge(service.badge)}
                          </div>
                          <div 
                            onClick={() => setActiveModalService(service)}
                            className="text-slate-100 font-semibold group-hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                          >
                            {service.name}
                          </div>
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                        {convertedRateFormatted}
                      </td>

                      {/* Min / Max */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 text-[11px] whitespace-nowrap">
                        {service.min.toLocaleString()} / {service.max.toLocaleString()}
                      </td>

                      {/* Avg Speed */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>{service.speed}</span>
                        </div>
                      </td>

                      {/* Guarantee */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{service.guarantee}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveModalService(service)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Full Specification"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectServiceForOrder(service.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                          >
                            Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={activeModalService.platform} className="w-4 h-4" />
                  <span className="text-xs text-blue-400 font-mono font-bold">Service #{activeModalService.id}</span>
                  {renderBadge(activeModalService.badge)}
                </div>
                <h3 className="text-base font-bold text-white">{activeModalService.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalService(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>{activeModalService.description}</p>
              <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] space-y-1">
                <div><span className="text-slate-400 font-sans">Example Link:</span> <code className="text-blue-400">{activeModalService.linkExample}</code></div>
                <div><span className="text-slate-400 font-sans">Min/Max:</span> {activeModalService.min.toLocaleString()} - {activeModalService.max.toLocaleString()}</div>
                <div><span className="text-slate-400 font-sans">Average Start:</span> {activeModalService.avgTime}</div>
                <div><span className="text-slate-400 font-sans">Delivery Speed:</span> {activeModalService.speed}</div>
                <div><span className="text-slate-400 font-sans">Guarantee:</span> <span className="text-emerald-400">{activeModalService.guarantee}</span></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-xs text-slate-400 block">Rate / 1k</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrencyAmount(activeModalService.ratePer1000, currency)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveModalService(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const sId = activeModalService.id;
                    setActiveModalService(null);
                    onSelectServiceForOrder(sId);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

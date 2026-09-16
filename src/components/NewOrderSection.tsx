import React, { useState, useMemo, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Tag
} from 'lucide-react';
import { PlatformType, SmmService, Currency, SmmOrder } from '../types';
import { SMM_SERVICES, CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';
import { PlatformIcon, getPlatformName } from './PlatformIcon';

interface NewOrderSectionProps {
  currency: Currency;
  balance: number;
  onPlaceOrder: (order: Omit<SmmOrder, 'id' | 'createdAt' | 'currentCount' | 'remains' | 'status' | 'refillAvailable'>) => { success: boolean; orderId?: string; error?: string };
  openDepositModal: () => void;
  preselectedServiceId?: number | null;
  onViewOrder: (orderId: string) => void;
}

export const NewOrderSection: React.FC<NewOrderSectionProps> = ({
  currency,
  balance,
  onPlaceOrder,
  openDepositModal,
  preselectedServiceId,
  onViewOrder
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('tiktok');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number>(101);
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [comments, setComments] = useState<string>('');
  
  // Drip feed state
  const [dripFeedEnabled, setDripFeedEnabled] = useState<boolean>(false);
  const [dripRuns, setDripRuns] = useState<number>(5);
  const [dripInterval, setDripInterval] = useState<number>(60);

  // Success modal / order receipt
  const [lastCreatedOrder, setLastCreatedOrder] = useState<{ id: string; serviceName: string; quantity: number; charge: number } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const curConfig = CURRENCY_CONFIGS[currency];

  // Handle preselected service if coming from Services list
  useEffect(() => {
    if (preselectedServiceId) {
      const s = SMM_SERVICES.find(srv => srv.id === preselectedServiceId);
      if (s) {
        setSelectedPlatform(s.platform);
        setSelectedCategory(s.category);
        setSelectedServiceId(s.id);
        if (quantity < s.min) setQuantity(s.min);
      }
    }
  }, [preselectedServiceId]);

  // Filtered categories for active platform
  const availableCategories = useMemo(() => {
    const list = SMM_SERVICES.filter(s => s.platform === selectedPlatform);
    const set = Array.from(new Set(list.map(s => s.category)));
    return set;
  }, [selectedPlatform]);

  // When platform changes, reset category and service
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [selectedPlatform, availableCategories, selectedCategory]);

  // Available services under selected category
  const servicesInCategory = useMemo(() => {
    return SMM_SERVICES.filter(s => s.platform === selectedPlatform && s.category === selectedCategory);
  }, [selectedPlatform, selectedCategory]);

  // Ensure selected service is in current category
  useEffect(() => {
    if (servicesInCategory.length > 0) {
      const exists = servicesInCategory.some(s => s.id === selectedServiceId);
      if (!exists) {
        setSelectedServiceId(servicesInCategory[0].id);
      }
    }
  }, [servicesInCategory, selectedServiceId]);

  const currentService = useMemo(() => {
    return SMM_SERVICES.find(s => s.id === selectedServiceId) || SMM_SERVICES[0];
  }, [selectedServiceId]);

  // Adjust quantity if below min or above max
  useEffect(() => {
    if (currentService) {
      if (quantity < currentService.min) {
        setQuantity(currentService.min);
      }
    }
  }, [currentService]);

  // Calculations
  const isCustomComments = currentService.name.toLowerCase().includes('comment');
  
  const effectiveQuantity = dripFeedEnabled ? (quantity * dripRuns) : quantity;
  const rawCostUSD = (currentService.ratePer1000 * effectiveQuantity) / 1000;
  const totalCost = Number(rawCostUSD.toFixed(4));
  const convertedCostFormatted = formatCurrencyAmount(totalCost, currency);
  const convertedRateFormatted = formatCurrencyAmount(currentService.ratePer1000, currency);

  const hasSufficientFunds = balance >= totalCost;

  const platforms: { id: PlatformType; label: string; count: number }[] = [
    { id: 'tiktok', label: 'TikTok', count: SMM_SERVICES.filter(s => s.platform === 'tiktok').length },
    { id: 'instagram', label: 'Instagram', count: SMM_SERVICES.filter(s => s.platform === 'instagram').length },
    { id: 'youtube', label: 'YouTube', count: SMM_SERVICES.filter(s => s.platform === 'youtube').length },
    { id: 'telegram', label: 'Telegram', count: SMM_SERVICES.filter(s => s.platform === 'telegram').length },
    { id: 'twitter', label: 'X (Twitter)', count: SMM_SERVICES.filter(s => s.platform === 'twitter').length },
    { id: 'facebook', label: 'Facebook', count: SMM_SERVICES.filter(s => s.platform === 'facebook').length },
    { id: 'spotify', label: 'Spotify', count: SMM_SERVICES.filter(s => s.platform === 'spotify').length },
    { id: 'applemusic', label: 'Apple Music', count: SMM_SERVICES.filter(s => s.platform === 'applemusic').length },
    { id: 'audiomack', label: 'Audiomack', count: SMM_SERVICES.filter(s => s.platform === 'audiomack').length },
    { id: 'boomplay', label: 'Boomplay', count: SMM_SERVICES.filter(s => s.platform === 'boomplay').length },
    { id: 'soundcloud', label: 'SoundCloud', count: SMM_SERVICES.filter(s => s.platform === 'soundcloud').length },
    { id: 'threads', label: 'Threads', count: SMM_SERVICES.filter(s => s.platform === 'threads').length },
    { id: 'discord', label: 'Discord', count: SMM_SERVICES.filter(s => s.platform === 'discord').length },
  ];

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!link.trim()) {
      setOrderError('Please provide a valid account URL, post link, or username.');
      return;
    }

    if (quantity < currentService.min || quantity > currentService.max) {
      setOrderError(`Quantity must be between ${currentService.min.toLocaleString()} and ${currentService.max.toLocaleString()}.`);
      return;
    }

    if (!hasSufficientFunds) {
      setOrderError(`Insufficient balance. Order total is $${totalCost.toFixed(2)}, your balance is $${balance.toFixed(2)}.`);
      return;
    }

    const result = onPlaceOrder({
      serviceId: currentService.id,
      serviceName: currentService.name,
      platform: currentService.platform,
      link: link.trim(),
      quantity: effectiveQuantity,
      charge: totalCost,
      startCount: Math.floor(Math.random() * 500) + 120,
      dripFeed: dripFeedEnabled ? {
        runs: dripRuns,
        intervalMinutes: dripInterval,
        totalQuantity: effectiveQuantity
      } : undefined
    });

    if (result.success && result.orderId) {
      setLastCreatedOrder({
        id: result.orderId,
        serviceName: currentService.name,
        quantity: effectiveQuantity,
        charge: totalCost
      });
      // Clear fields
      setLink('');
    } else {
      setOrderError(result.error || 'Failed to process order. Please try again.');
    }
  };

  const setPresetQuantity = (qty: number) => {
    if (qty >= currentService.min && qty <= currentService.max) {
      setQuantity(qty);
    } else if (qty < currentService.min) {
      setQuantity(currentService.min);
    } else {
      setQuantity(currentService.max);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Notification */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Supplier Rates • 100% Automated Instant Start</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Boost Any Social Media Account Instantly
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Order real engagement, followers, views, and subscribers at wholesale reseller prices. Trusted by over 85,000+ marketing agencies and content creators worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Avg. Start Time</span>
              <span className="text-emerald-400 font-bold text-base font-mono">&lt; 90 Seconds</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Refill Guarantee</span>
              <span className="text-blue-400 font-bold text-base">Up to 365 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Selector Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Step 1: Select Platform</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {platforms.map(p => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                id={`platform-btn-${p.id}`}
                onClick={() => setSelectedPlatform(p.id)}
                type="button"
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1.5 ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20 text-white font-bold ring-1 ring-blue-500' 
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/30' : 'bg-slate-800'}`}>
                  <PlatformIcon platform={p.id} className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium tracking-tight truncate w-full">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order Creation Layout: Form (Left) & Service Intel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Order Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Place New Order</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Platform: <strong className="text-blue-400 capitalize">{getPlatformName(selectedPlatform)}</strong>
            </span>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4" id="smm-new-order-form">
            
            {/* Category Select */}
            <div className="space-y-1.5">
              <label htmlFor="order-category-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Category</span>
                <span className="text-red-400">*</span>
              </label>
              <select
                id="order-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {availableCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="order-service-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Service</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-emerald-400 font-mono font-medium">
                  {convertedRateFormatted} / 1k
                </span>
              </div>
              <select
                id="order-service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {servicesInCategory.map(service => (
                  <option key={service.id} value={service.id}>
                    #{service.id} - {service.name} - {formatCurrencyAmount(service.ratePer1000, currency)}/1k
                  </option>
                ))}
              </select>
            </div>

            {/* Link Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="order-link-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Target Link or Username</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Example: <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">{currentService.linkExample}</code>
                </span>
              </div>
              <input
                id="order-link-input"
                type="text"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={currentService.linkExample}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>Make sure your profile or post is set to <strong>Public</strong> (not private) before ordering.</span>
              </p>
            </div>

            {/* Custom Comments textarea if applicable */}
            {isCustomComments && (
              <div className="space-y-1.5">
                <label htmlFor="order-comments-input" className="text-xs font-semibold text-slate-300">
                  Custom Comments (1 per line)
                </label>
                <textarea
                  id="order-comments-input"
                  rows={4}
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    const lineCount = e.target.value.split('\n').filter(l => l.trim().length > 0).length;
                    if (lineCount > 0) setQuantity(lineCount);
                  }}
                  placeholder="Awesome post! 🔥&#10;Incredible work keep it up! 👍&#10;Best content on my feed! 🚀"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            )}

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="order-quantity-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Quantity</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  Min: <strong className="text-slate-300">{currentService.min.toLocaleString()}</strong> | Max: <strong className="text-slate-300">{currentService.max.toLocaleString()}</strong>
                </span>
              </div>
              <input
                id="order-quantity-input"
                type="number"
                min={currentService.min}
                max={currentService.max}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono font-bold"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
                {[500, 1000, 2500, 5000, 10000, 25000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPresetQuantity(val)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Drip Feed Toggle Option */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="drip-feed-checkbox"
                    checked={dripFeedEnabled}
                    onChange={(e) => setDripFeedEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="drip-feed-checkbox" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <span>Enable Drip-Feed (Gradual Natural Delivery)</span>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.2 rounded">PRO</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Delivers in automated batches</span>
              </div>

              {dripFeedEnabled && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800/80 animate-in fade-in">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Runs (Batches)</label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={dripRuns}
                      onChange={(e) => setDripRuns(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Interval (Minutes)</label>
                    <input
                      type="number"
                      min={10}
                      max={1440}
                      value={dripInterval}
                      onChange={(e) => setDripInterval(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] text-slate-400 block mb-1">Total Quantity</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-mono font-bold">
                      {effectiveQuantity.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {orderError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Price & Checkout Action */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Total Order Charge</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white font-mono">
                      {convertedCostFormatted}
                    </span>
                    {currency !== 'USD' && (
                      <span className="text-xs text-slate-400 font-mono">(${totalCost.toFixed(2)} USD)</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Your Balance</span>
                  <span className={`text-sm font-bold font-mono ${hasSufficientFunds ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${balance.toFixed(2)} USD ({formatCurrencyAmount(balance, currency)})
                  </span>
                </div>
              </div>

              {hasSufficientFunds ? (
                <button
                  type="submit"
                  id="submit-new-order-btn"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Submit Order ({convertedCostFormatted})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={openDepositModal}
                    id="insufficient-funds-deposit-btn"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Insufficient Balance — Deposit Funds to Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-slate-400">
                    Instant automated deposits available via Crypto (+5% Bonus), Cards, and PayPal.
                  </p>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Right Column: Service Specifications & Quality Guarantees */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Service Intelligence Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Service Specification</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                ID #{currentService.id}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white leading-snug">
                {currentService.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {currentService.description}
              </p>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Start Time</span>
                </div>
                <div className="text-xs font-bold text-white font-mono">
                  {currentService.avgTime}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Delivery Speed</span>
                </div>
                <div className="text-xs font-bold text-white font-mono">
                  {currentService.speed}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Guarantee</span>
                </div>
                <div className="text-xs font-bold text-emerald-300">
                  {currentService.guarantee}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Wholesale Rate</span>
                </div>
                <div className="text-xs font-bold text-blue-400 font-mono">
                  {convertedRateFormatted} / 1k
                </div>
              </div>
            </div>

            {/* Guarantees List */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% Safe with Social Media Algorithms (No Bans)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Automated 24/7 API Queue Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Free 1-Click Auto-Refill Button on Drops</span>
              </div>
            </div>

          </div>

          {/* Quick Reseller Advice Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Reseller Pro-Tip:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Order engagement (Likes + Saves + Views) within the first <strong>30 minutes</strong> of posting to maximize your chances of getting pushed onto the Explore / For You page.
            </p>
          </div>

        </div>

      </div>

      {/* Order Confirmation Modal */}
      {lastCreatedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Order Received Successfully!</h3>
              <p className="text-xs text-slate-400">
                Your order has been queued into our high-speed delivery node.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Order ID:</span>
                <span className="text-blue-400 font-bold">{lastCreatedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Quantity:</span>
                <span className="text-white">{lastCreatedOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Charged:</span>
                <span className="text-emerald-400 font-bold">${lastCreatedOrder.charge.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Status:</span>
                <span className="text-amber-400 font-bold">Processing (Queued)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  const id = lastCreatedOrder.id;
                  setLastCreatedOrder(null);
                  onViewOrder(id);
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Track Order Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLastCreatedOrder(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Place Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Flame, 
  Layers, 
  ShoppingBag, 
  FileText, 
  Wallet, 
  Terminal, 
  HelpCircle, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  balance: number;
  openDepositModal: () => void;
  ordersCount: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  balance,
  openDepositModal,
  ordersCount,
  isAdmin,
  onOpenAdminLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const curConfig = CURRENCY_CONFIGS[currency];
  const formattedBalance = formatCurrencyAmount(balance, currency);

  const navItems = [
    { id: 'new-order', label: 'New Order', icon: Flame, highlight: true },
    { id: 'services', label: 'Services & Rates', icon: Layers },
    { id: 'orders', label: 'Orders & Tracking', icon: ShoppingBag, badge: ordersCount },
    { id: 'mass-order', label: 'Mass Order', icon: FileText },
    { id: 'add-funds', label: 'Add Funds', icon: Wallet },
    { id: 'api', label: 'API V2', icon: Terminal },
    { id: 'support', label: 'Support & FAQ', icon: HelpCircle },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert, highlight: true }] : [])
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top micro-announcement bar */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/80 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Servers: 100% Operational (42ms)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Orders Today: <strong className="text-slate-200">54,821</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crypto deposits receive <strong className="text-amber-200">+5% instant bonus</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auto-Refill Guarantee Active</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('new-order')}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  media<span className="text-blue-400">smm</span>
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                  V2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                #1 SMM RESELLER PANEL
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Currency Selector & Wallet Balance */}
          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-colors"
                title="Change currency"
              >
                <span>{curConfig.flag}</span>
                <span className="font-bold text-blue-400">{curConfig.symbol}</span>
                <span className="font-mono">{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in"
                  id="currency-dropdown-menu"
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Select Currency</span>
                    <span className="text-emerald-400 font-normal">Live conversion</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-blue-400">Africa Local Currencies</div>
                    {(['NGN', 'GHS', 'XAF', 'XOF'] as Currency[]).map((code) => {
                      const cfg = CURRENCY_CONFIGS[code];
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setCurrency(code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-800 transition-colors ${
                            currency === code ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cfg.flag}</span>
                            <span className="font-mono font-bold text-slate-300 w-8">{cfg.symbol}</span>
                            <span>{code}</span>
                            <span className="text-[11px] text-slate-400">({cfg.country})</span>
                          </div>
                          {currency === code && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}

                    <div className="px-3 py-1 pt-2 text-[10px] font-semibold text-slate-400 border-t border-slate-800 mt-1">Global Currencies</div>
                    {(['USD', 'EUR', 'GBP', 'BRL', 'INR'] as Currency[]).map((code) => {
                      const cfg = CURRENCY_CONFIGS[code];
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setCurrency(code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-800 transition-colors ${
                            currency === code ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cfg.flag}</span>
                            <span className="font-mono font-bold text-slate-300 w-8">{cfg.symbol}</span>
                            <span>{code}</span>
                            <span className="text-[11px] text-slate-400">({cfg.name})</span>
                          </div>
                          {currency === code && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Balance Chip */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 pl-3 shadow-inner">
              <div className="flex flex-col text-right mr-2">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Balance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono leading-none">
                  {formattedBalance}
                </span>
              </div>
              <button
                id="header-deposit-btn"
                onClick={openDepositModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Funds</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>

            {/* Admin Login / Portal Button */}
            {isAdmin ? (
              <button
                id="header-admin-active-btn"
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
                title="Open Admin Control Panel"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            ) : (
              <button
                id="header-admin-login-btn"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
                title="Admin / Owner Login"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

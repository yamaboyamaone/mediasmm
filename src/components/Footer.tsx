import React from 'react';
import { Flame, ShieldCheck, Zap, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAdminLogin }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-12 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <span className="text-lg font-bold text-white font-mono tracking-tight">
                media<span className="text-blue-400">smm</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The premier wholesale SMM panel platform providing high-retention social media engagement, followers, views, and automated reseller growth. Fully integrated with instant API V2.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Non-Drop & Auto-Refill Protected Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('new-order')} className="hover:text-blue-400 transition-colors">
                  New Order
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('services')} className="hover:text-blue-400 transition-colors">
                  Services & Rates
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('orders')} className="hover:text-blue-400 transition-colors">
                  Orders & Tracking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('mass-order')} className="hover:text-blue-400 transition-colors">
                  Mass Order
                </button>
              </li>
            </ul>
          </div>

          {/* API & Developer */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Developers</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('api')} className="hover:text-blue-400 transition-colors">
                  API V2 Documentation
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('api')} className="hover:text-blue-400 transition-colors">
                  Generate API Key
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('support')} className="hover:text-blue-400 transition-colors">
                  System Status
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('support')} className="hover:text-blue-400 transition-colors">
                  FAQ & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Gateways */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Accepted Payment Gateways</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              🇳🇬 Paystack (Naira ₦, OPay, PalmPay), 🇬🇭 GHS MoMo, 🇨🇲 🇳🇪 Cameroon/Niger FCFA/CFA, Flutterwave, USDT TRC20, Cards & Binance Pay.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Auto-Credit & 256-Bit SSL Secured</span>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">mediasmm</strong>. All rights reserved. Direct SMM supplier network.
          </div>
          <div className="flex gap-4 items-center">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Refund Policy</span>
            <span>•</span>
            <button
              onClick={onOpenAdminLogin}
              className="text-amber-400/90 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
            >
              🔒 Admin Login
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

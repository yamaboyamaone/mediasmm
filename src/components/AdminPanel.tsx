import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Building2, 
  Percent, 
  Save, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Eye, 
  LogOut, 
  Sliders, 
  ExternalLink,
  Wallet,
  Sparkles,
  Search,
  KeyRound
} from 'lucide-react';
import { SmmOrder, Currency, OwnerBankDetails } from '../types';
import { SMM_SERVICES, CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';

interface AdminPanelProps {
  orders: SmmOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: SmmOrder['status']) => void;
  currency: Currency;
  onLogout: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  onUpdateOrderStatus,
  currency,
  onLogout,
  onClose,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'margin' | 'bank' | 'orders' | 'security'>('overview');

  // Profit Margin multiplier (e.g. 1.5 = +50% profit, 2.0 = +100% profit)
  const [profitMarkupPercent, setProfitMarkupPercent] = useState<number>(() => {
    const saved = localStorage.getItem('mediasmm_profit_markup');
    return saved ? parseInt(saved, 10) : 80; // default 80% markup
  });
  const [markupSaved, setMarkupSaved] = useState(false);

  // Bank details stored in state and localStorage
  const [bankDetails, setBankDetails] = useState<OwnerBankDetails>(() => {
    try {
      const saved = localStorage.getItem('mediasmm_owner_bank');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      bankName: 'Moniepoint MFB',
      accountNumber: '6054182456',
      accountName: 'Yasir Mustapha Aliyu',
      country: 'Nigeria',
      instructions: 'Use your username or order reference as transfer narration.',
      whatsappNumber: '+2348149204891'
    };
  });
  const [bankSavedSuccess, setBankSavedSuccess] = useState(false);

  // Security credentials
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Filter orders
  const [orderSearch, setOrderSearch] = useState('');

  // Calculate quick stats
  const totalOrdersCount = orders.length;
  const totalRevenueUSD = orders.reduce((sum, o) => sum + o.charge, 0);
  const estimatedWholesaleCost = totalRevenueUSD * (1 / (1 + profitMarkupPercent / 100));
  const estimatedProfitUSD = totalRevenueUSD - estimatedWholesaleCost;

  const handleSaveMarkup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mediasmm_profit_markup', profitMarkupPercent.toString());
    setMarkupSaved(true);
    setTimeout(() => setMarkupSaved(false), 2000);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mediasmm_owner_bank', JSON.stringify(bankDetails));
    setBankSavedSuccess(true);
    setTimeout(() => setBankSavedSuccess(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    if (newAdminPassword.length < 5) {
      setPassError('Password must be at least 5 characters long.');
      return;
    }
    if (newAdminPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }
    localStorage.setItem('mediasmm_admin_password', newAdminPassword.trim());
    setPassSuccess(true);
    setNewAdminPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccess(false), 2500);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.serviceName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.link.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Owner Greeting & Quick Logout */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Admin & Owner Control Center</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Super Admin Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-200">Yasir Mustapha Aliyu</strong> (admin) &bull; Settlement: <strong className="text-emerald-400">Moniepoint MFB (6054182456)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Revenue & Overview', icon: TrendingUp },
          { id: 'margin', label: 'Profit Margins & Pricing', icon: Sliders },
          { id: 'bank', label: 'Bank Settlement Account', icon: Building2 },
          { id: 'orders', label: 'Manage Orders', icon: ShoppingBag, badge: orders.length },
          { id: 'security', label: 'Admin Password & Security', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & PROFIT ANALYTICS */}
      {adminTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Customer Spend</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {formatCurrencyAmount(totalRevenueUSD, currency)}
              </div>
              <div className="text-[11px] text-slate-400">
                ${totalRevenueUSD.toFixed(2)} USD Gross Revenue
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
                <span>Your Net Profit Margin</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {formatCurrencyAmount(estimatedProfitUSD, currency)}
              </div>
              <div className="text-[11px] text-emerald-300/80">
                ~{profitMarkupPercent}% average profit markup applied
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Orders Placed</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {totalOrdersCount}
              </div>
              <div className="text-[11px] text-slate-400">
                Across TikTok, IG, Spotify & YouTube
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Direct Bank Settlement</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-base font-bold text-white truncate">
                {bankDetails.accountNumber}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {bankDetails.bankName} &bull; {bankDetails.accountName}
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🚀 Owner Playbook: How You Fulfill & Profit Daily</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <strong className="text-amber-400 block font-semibold">1. Customer Deposits</strong>
                <p className="text-slate-400 leading-relaxed">
                  Customers pay directly into your personal <strong>Moniepoint MFB ({bankDetails.accountNumber})</strong> or through Paystack/Crypto.
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <strong className="text-blue-400 block font-semibold">2. Automated Pricing</strong>
                <p className="text-slate-400 leading-relaxed">
                  Your retail prices include your customized profit margin (currently +{profitMarkupPercent}%). You keep the markup difference automatically.
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <strong className="text-emerald-400 block font-semibold">3. Fulfill Orders</strong>
                <p className="text-slate-400 leading-relaxed">
                  Connect your upstream SMM wholesale provider key in API V2, or route pending customer links into wholesale servers to deliver the service.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT MARGINS */}
      {adminTab === 'margin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              <span>Global Profit Markup Controller</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust how much markup percentage you earn on all retail services across the panel.
            </p>
          </div>

          <form onSubmit={handleSaveMarkup} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">Retail Markup Percentage:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">+{profitMarkupPercent}% Markup</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={profitMarkupPercent}
                onChange={(e) => setProfitMarkupPercent(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>+20% (Lowest Cost)</span>
                <span>+80% (Recommended Balance)</span>
                <span>+150% (High Margin)</span>
                <span>+300% (Maximum Profit)</span>
              </div>
            </div>

            {/* Live Profit Preview Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Example Live Price Calculation with +{profitMarkupPercent}%:</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900">
                  <span className="text-[10px] text-slate-400 block font-sans">Wholesale Provider Cost</span>
                  <strong className="text-slate-200">$1.00 USD / ₦1,550</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900">
                  <span className="text-[10px] text-slate-400 block font-sans">Customer Pays You</span>
                  <strong className="text-blue-400">${(1 + profitMarkupPercent / 100).toFixed(2)} USD</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-sans">Your Pure Profit</span>
                  <strong className="text-emerald-400">+${(profitMarkupPercent / 100).toFixed(2)} USD (₦{Math.round((profitMarkupPercent / 100) * 1550).toLocaleString()})</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {markupSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{markupSaved ? 'Markup Saved Successfully!' : 'Save Profit Markup'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: BANK SETTLEMENT */}
      {adminTab === 'bank' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Owner Bank Settlement Account</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              This is the bank account displayed to users when they choose <strong>Nigerian Bank Transfer</strong>.
            </p>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Account Number (NUBAN)</label>
                <input
                  type="text"
                  required
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Account Holder / Beneficiary</label>
                <input
                  type="text"
                  required
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">WhatsApp Number for Receipts</label>
                <input
                  type="tel"
                  value={bankDetails.whatsappNumber || ''}
                  onChange={(e) => setBankDetails({ ...bankDetails, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Transfer Narration / Remark Instructions</label>
              <input
                type="text"
                value={bankDetails.instructions || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, instructions: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {bankSavedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{bankSavedSuccess ? 'Bank Account Saved!' : 'Update Settlement Account'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <span>Customer Order Status Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manually mark orders as In Progress, Completed, or Canceled/Refunded.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID or link..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white w-64 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Target Link</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Charge</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-amber-400 font-bold">{order.id}</td>
                    <td className="p-3 font-sans text-white max-w-xs truncate">{order.serviceName}</td>
                    <td className="p-3 text-blue-400 max-w-[180px] truncate">
                      <a href={order.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <span className="truncate">{order.link}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 text-slate-200">{order.quantity.toLocaleString()}</td>
                    <td className="p-3 text-emerald-400">{formatCurrencyAmount(order.charge, currency)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'Processing' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-sans">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Partial">Partial</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & PASSWORD */}
      {adminTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-rose-400" />
              <span>Admin Login Credentials & Security</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Change the master password required to access this admin panel.
            </p>
          </div>

          {passSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Admin password updated successfully! Remember to use your new password next time you sign in.</span>
            </div>
          )}

          {passError && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">New Admin Password</label>
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Admin Password</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingBag, 
  RefreshCw, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import { SmmOrder, OrderStatus, Currency } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';
import { PlatformIcon } from './PlatformIcon';

interface OrdersTrackerProps {
  orders: SmmOrder[];
  currency: Currency;
  onRefillOrder: (orderId: string) => void;
  onSpeedUpOrder: (orderId: string) => void;
  trackedOrderId?: string | null;
}

export const OrdersTracker: React.FC<OrdersTrackerProps> = ({
  orders,
  currency,
  onRefillOrder,
  onSpeedUpOrder,
  trackedOrderId
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(trackedOrderId || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const curConfig = CURRENCY_CONFIGS[currency];

  const statusList = ['All', 'In Progress', 'Processing', 'Completed', 'Pending', 'Partial'];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (activeStatusFilter !== 'All' && o.status !== activeStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesLink = o.link.toLowerCase().includes(q);
        const matchesService = o.serviceName.toLowerCase().includes(q);
        if (!matchesId && !matchesLink && !matchesService) return false;
      }
      return true;
    });
  }, [orders, activeStatusFilter, searchQuery]);

  // Selected order for live deep tracking card
  const selectedTrackedOrder = useMemo(() => {
    if (searchQuery.trim()) {
      return orders.find(o => o.id.toLowerCase() === searchQuery.toLowerCase().trim()) || null;
    }
    return orders[0] || null;
  }, [orders, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerRefill = (orderId: string) => {
    onRefillOrder(orderId);
    setActionFeedback(`Auto-Refill request dispatched for Order #${orderId}. Re-checking count now.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const triggerSpeedUp = (orderId: string) => {
    onSpeedUpOrder(orderId);
    setActionFeedback(`Order #${orderId} moved to Priority Node. Speed boost active.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold animate-pulse">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[11px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>Partial</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold">
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-blue-950/80 border border-blue-500 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-lg">
          <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Live Order Tracker Banner / Search */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <span>Order History & Real-Time Status Tracker</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Check live delivery progress, start count verification, and trigger 1-click free auto-refills.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="order-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID (e.g. MS-928402)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Selected Order Detailed Telemetry Card */}
        {selectedTrackedOrder && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-4 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <PlatformIcon platform={selectedTrackedOrder.platform} className="w-5 h-5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{selectedTrackedOrder.id}</span>
                    {getStatusBadge(selectedTrackedOrder.status)}
                    {selectedTrackedOrder.speedUpRequested && (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        PRIORITY SPEED ⚡
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 truncate max-w-md block">
                    {selectedTrackedOrder.serviceName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTrackedOrder.status === 'In Progress' && (
                  <button
                    onClick={() => triggerSpeedUp(selectedTrackedOrder.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Speed Up</span>
                  </button>
                )}
                {selectedTrackedOrder.refillAvailable && (
                  <button
                    onClick={() => triggerRefill(selectedTrackedOrder.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Free Refill</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar & Telemetry */}
            {(() => {
              const delivered = Math.max(0, selectedTrackedOrder.quantity - selectedTrackedOrder.remains);
              const progressPct = selectedTrackedOrder.quantity > 0 
                ? Math.min(100, Math.round((delivered / selectedTrackedOrder.quantity) * 100))
                : 100;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Delivery Progress</span>
                    <span className="text-blue-400 font-bold font-mono">{progressPct}% Delivered ({delivered.toLocaleString()} / {selectedTrackedOrder.quantity.toLocaleString()})</span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Start Count</span>
                      <span className="font-mono font-bold text-slate-200">{selectedTrackedOrder.startCount.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Current Estimated</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(selectedTrackedOrder.startCount + delivered).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Remains</span>
                      <span className="font-mono font-bold text-amber-300">{selectedTrackedOrder.remains.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Total Charged</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrencyAmount(selectedTrackedOrder.charge, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statusList.map(status => {
          const isSelected = activeStatusFilter === status;
          const count = status === 'All' ? orders.length : orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="orders-history-table">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-28">Order ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Link</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Charge</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => setSearchQuery(order.id)}
                          className="cursor-pointer hover:underline"
                          title="Click to track in live dashboard"
                        >
                          {order.id}
                        </span>
                        <button
                          onClick={() => handleCopy(order.id, order.id)}
                          className="text-slate-500 hover:text-slate-300"
                          title="Copy Order ID"
                        >
                          {copiedId === order.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-sans">{order.createdAt}</span>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={order.platform} className="w-4 h-4 flex-shrink-0" />
                        <span className="text-slate-200 font-medium truncate" title={order.serviceName}>
                          {order.serviceName}
                        </span>
                      </div>
                    </td>

                    {/* Link */}
                    <td className="py-3.5 px-4 max-w-[160px] truncate font-mono text-[11px] text-slate-400">
                      <a 
                        href={order.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{order.link}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200 whitespace-nowrap">
                      {order.quantity.toLocaleString()}
                    </td>

                    {/* Charge */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatCurrencyAmount(order.charge, currency)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.refillAvailable && (
                          <button
                            onClick={() => triggerRefill(order.id)}
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-semibold cursor-pointer"
                            title="Request Free Refill"
                          >
                            Refill
                          </button>
                        )}
                        {order.status === 'In Progress' && (
                          <button
                            onClick={() => triggerSpeedUp(order.id)}
                            className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-semibold cursor-pointer"
                            title="Boost Speed"
                          >
                            Speed
                          </button>
                        )}
                        <button
                          onClick={() => setSearchQuery(order.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold"
                          title="View Live Telemetry"
                        >
                          Track
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

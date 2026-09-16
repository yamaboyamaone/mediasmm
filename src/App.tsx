import React, { useState, useEffect } from 'react';
import { Currency, SmmOrder } from './types';
import { INITIAL_ORDERS } from './data/servicesData';
import { Header } from './components/Header';
import { NewOrderSection } from './components/NewOrderSection';
import { ServicesTable } from './components/ServicesTable';
import { OrdersTracker } from './components/OrdersTracker';
import { MassOrderSection } from './components/MassOrderSection';
import { AddFundsModal } from './components/AddFundsModal';
import { ApiDocsSection } from './components/ApiDocsSection';
import { SupportSection } from './components/SupportSection';
import { StatsBanner } from './components/StatsBanner';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('new-order');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [balance, setBalance] = useState<number>(25.0);
  const [orders, setOrders] = useState<SmmOrder[]>(INITIAL_ORDERS);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [openWithBankEditor, setOpenWithBankEditor] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  
  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('mediasmm_is_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Background simulation: periodically advance "In Progress" or "Processing" orders
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.status === 'Processing') {
            return { ...order, status: 'In Progress' };
          }
          if (order.status === 'In Progress' && order.remains > 0) {
            const decrement = Math.min(order.remains, Math.floor(Math.random() * 200) + 50);
            const newRemains = order.remains - decrement;
            const newCurrent = order.currentCount + decrement;
            return {
              ...order,
              remains: newRemains,
              currentCount: newCurrent,
              status: newRemains === 0 ? 'Completed' : 'In Progress',
              refillAvailable: newRemains === 0
            };
          }
          return order;
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = (newOrderData: Omit<SmmOrder, 'id' | 'createdAt' | 'currentCount' | 'remains' | 'status' | 'refillAvailable'>) => {
    if (balance < newOrderData.charge) {
      return { success: false, error: 'Insufficient funds in wallet' };
    }

    const orderId = 'MS-' + Math.floor(100000 + Math.random() * 900000);
    const order: SmmOrder = {
      ...newOrderData,
      id: orderId,
      currentCount: newOrderData.startCount,
      remains: newOrderData.quantity,
      status: 'Processing',
      createdAt: 'Just now',
      refillAvailable: false
    };

    setBalance(prev => Number((prev - newOrderData.charge).toFixed(4)));
    setOrders(prev => [order, ...prev]);
    return { success: true, orderId };
  };

  const handleBatchOrders = (batchList: Omit<SmmOrder, 'id' | 'createdAt' | 'currentCount' | 'remains' | 'status' | 'refillAvailable'>[]) => {
    const totalCharge = batchList.reduce((acc, curr) => acc + curr.charge, 0);
    if (balance < totalCharge) {
      return { success: false, count: 0, error: 'Insufficient funds' };
    }

    const created: SmmOrder[] = batchList.map((item, idx) => ({
      ...item,
      id: 'MS-' + Math.floor(100000 + Math.random() * 900000 + idx),
      currentCount: item.startCount,
      remains: item.quantity,
      status: 'Processing',
      createdAt: 'Just now',
      refillAvailable: false
    }));

    setBalance(prev => Number((prev - totalCharge).toFixed(4)));
    setOrders(prev => [...created, ...prev]);
    return { success: true, count: created.length };
  };

  const handleDepositFunds = (amountCredited: number, gatewayName: string) => {
    setBalance(prev => Number((prev + amountCredited).toFixed(2)));
  };

  const handleSelectServiceFromCatalog = (serviceId: number) => {
    setPreselectedServiceId(serviceId);
    setActiveTab('new-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrder = (orderId: string) => {
    setTrackedOrderId(orderId);
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefillOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, refillRequested: true } : o));
  };

  const handleSpeedUpOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, speedUpRequested: true } : o));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        balance={balance}
        openDepositModal={() => setIsDepositModalOpen(true)}
        ordersCount={orders.length}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel
              orders={orders}
              onUpdateOrderStatus={(orderId, newStatus) => {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
              }}
              currency={currency}
              onLogout={() => {
                localStorage.removeItem('mediasmm_is_admin');
                setIsAdmin(false);
                setActiveTab('new-order');
              }}
              onClose={() => setActiveTab('new-order')}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-white">Admin Access Restricted</h2>
              <p className="text-xs text-slate-400">
                You must sign in with your admin credentials to access the owner control panel.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                Sign In As Admin
              </button>
            </div>
          )
        )}
        
        {/* Active Tab View */}
        {activeTab === 'new-order' && (
          <div className="space-y-8">
            <NewOrderSection
              currency={currency}
              balance={balance}
              onPlaceOrder={handlePlaceOrder}
              openDepositModal={() => setIsDepositModalOpen(true)}
              preselectedServiceId={preselectedServiceId}
              onViewOrder={handleViewOrder}
            />
            <StatsBanner />
          </div>
        )}

        {activeTab === 'services' && (
          <ServicesTable
            currency={currency}
            onSelectServiceForOrder={handleSelectServiceFromCatalog}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTracker
            orders={orders}
            currency={currency}
            onRefillOrder={handleRefillOrder}
            onSpeedUpOrder={handleSpeedUpOrder}
            trackedOrderId={trackedOrderId}
          />
        )}

        {activeTab === 'mass-order' && (
          <MassOrderSection
            currency={currency}
            balance={balance}
            onBatchOrders={handleBatchOrders}
            openDepositModal={() => setIsDepositModalOpen(true)}
            onViewOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'add-funds' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h1 className="text-xl font-bold text-white">Add Funds & Instant Wallet Top-Up</h1>
              <p className="text-xs text-slate-400">
                Deposit credits to your mediasmm account to place single or automated reseller API orders using Nigerian Bank Transfer, Mobile Money (Ghana/Cameroon/Niger), Cards, or Crypto.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    setOpenWithBankEditor(false);
                    setIsDepositModalOpen(true);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
                >
                  Open Deposit Gateway (+3% Bank / +5% Crypto Bonus)
                </button>
                <button
                  onClick={() => {
                    setOpenWithBankEditor(true);
                    setIsDepositModalOpen(true);
                  }}
                  className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>⚙️ Set / Edit My Personal Bank Account</span>
                </button>
              </div>
            </div>

            {/* Quick Informational Guide & Active Bank Account Card */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <span>🏦 Connected Personal Bank Account</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Active & Ready
                  </span>
                </div>
                <button
                  onClick={() => {
                    setOpenWithBankEditor(true);
                    setIsDepositModalOpen(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                >
                  Edit Bank Details
                </button>
              </div>

              {/* Bank Details Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Account Holder Name</span>
                  <strong className="text-white text-sm font-semibold">Yasir Mustapha Aliyu</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Account Number (NUBAN)</span>
                  <strong className="text-emerald-400 text-base font-mono font-bold tracking-wider">6054182456</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Bank Institution</span>
                  <strong className="text-white text-sm font-semibold">Moniepoint MFB</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                When customers choose <strong>Nigerian Bank Transfer</strong> to fund their wallet, they will transfer funds directly to this Moniepoint MFB account. 100% of the funds go straight to your personal account.
              </p>
            </div>

            <StatsBanner />
          </div>
        )}

        {activeTab === 'api' && (
          <ApiDocsSection balance={balance} />
        )}

        {activeTab === 'support' && (
          <SupportSection orders={orders} />
        )}

      </main>

      {/* Global Add Funds Modal */}
      <AddFundsModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setOpenWithBankEditor(false);
        }}
        currency={currency}
        onDeposit={handleDepositFunds}
        balance={balance}
        initialEditBank={openWithBankEditor}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />

      {/* Footer */}
      <Footer 
        setActiveTab={setActiveTab} 
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)} 
      />
    </div>
  );
}

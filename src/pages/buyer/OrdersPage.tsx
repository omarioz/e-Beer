import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Mic, Truck, Receipt } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/SkeletonLoader';
import { OrderCard } from '@/components/buyer/OrderCard';
import { TrackDrawer } from '@/components/buyer/TrackDrawer';
import { InvoiceModal } from '@/components/buyer/InvoiceModal';
import { useTranslation } from 'react-i18next';
import { useOffline } from '@/hooks/useOffline';
import { apiClient } from '@/lib/api';

interface Order {
  id: string;
  buyer: string;
  buyer_name: string;
  produce: string;
  produce_name: string;
  farmer_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'delivered' | 'cancelled';
  delivery_route: string;
  created_at: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    produceName: 'Organic Tomatoes',
    thumbnail: 'https://images.unsplash.com/photo-1546470427-e5b89611f433?w=64&h=64&fit=crop',
    quantity: 5,
    pricePerKg: 2.50,
    total: 12.50,
    farmer: 'Ahmed Hassan',
    region: 'Mogadishu',
    status: 'in-transit',
    type: 'active',
    eta: '2 hours',
    courierName: 'Mohamed Ali',
    courierPhone: '+252611234567',
    trackingData: {
      farmLocation: [2.0469, 45.3182],
      buyerLocation: [2.0371, 45.3438],
      courierLocation: [2.0420, 45.3310]
    }
  },
  {
    id: 'ORD-002',
    produceName: 'Fresh Bananas',
    thumbnail: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=64&h=64&fit=crop',
    quantity: 10,
    pricePerKg: 1.80,
    total: 18.00,
    farmer: 'Fatima Omar',
    region: 'Kismayo',
    status: 'delivered',
    type: 'completed'
  }
];

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackDrawer, setShowTrackDrawer] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const { isOffline } = useOffline();
  
  const activeTab = searchParams.get('status') || 'active';

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: async () => {
      const response = await apiClient.getOrders();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.produce_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status for active/completed tabs
    if (activeTab === 'active') {
      return matchesSearch && ['pending', 'accepted'].includes(order.status);
    } else if (activeTab === 'completed') {
      return matchesSearch && ['delivered', 'cancelled'].includes(order.status);
    }
    
    return matchesSearch;
  }) || [];

  const handleTabChange = (status: string) => {
    setSearchParams({ status });
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      
      recognition.start();
    }
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackDrawer(true);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <Header />
      
      <div className="pt-16 pb-20 px-4">
        {/* Segmented Control */}
        <div className="flex bg-muted rounded-lg p-1 mb-4">
          <button
            onClick={() => handleTabChange('active')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {t('orders.active')}
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'completed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {t('orders.completed')}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('orders.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={handleVoiceSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 shadow-sm">
                <Skeleton className="w-full h-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">{t('orders.loadError')}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-destructive hover:underline"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            illustration={activeTab === 'active' ? <Truck className="w-16 h-16" /> : <Receipt className="w-16 h-16" />}
            title={activeTab === 'active' ? t('orders.emptyActive') : t('orders.emptyCompleted')}
            description={activeTab === 'active' ? t('orders.emptyActiveDesc') : t('orders.emptyCompletedDesc')}
          />
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTrack={() => handleTrackOrder(order)}
                onViewInvoice={() => handleViewInvoice(order)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Track Drawer */}
      {selectedOrder && (
        <TrackDrawer
          isOpen={showTrackDrawer}
          onClose={() => setShowTrackDrawer(false)}
          order={selectedOrder}
        />
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};
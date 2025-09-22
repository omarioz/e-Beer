import React, { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/navigation/BottomNav';
import { BuyerShop } from '@/components/buyer/BuyerShop';
import { OrdersPage } from '@/pages/buyer/OrdersPage';
import { BuyerProfilePage } from '@/pages/buyer/BuyerProfilePage';
import { FarmerDashboard } from '@/components/farmer/FarmerDashboard';
import { ListingsPage } from '@/pages/farmer/ListingsPage';
import { AddListing } from '@/components/farmer/AddListing';
import { FarmerProfilePage } from '@/pages/farmer/FarmerProfilePage';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { LogisticsPage } from '@/pages/admin/LogisticsPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'buyer' | 'farmer' | 'admin';

export const EBeerApp: React.FC = () => {
  const { role: userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('shop'); // Default to shop, will be updated by useEffect

  // Update active tab when role changes
  useEffect(() => {
    if (userRole === 'buyer') {
      setActiveTab('shop');
    } else if (userRole === 'farmer') {
      setActiveTab('dashboard');
    } else if (userRole === 'admin') {
      setActiveTab('analytics');
    }
  }, [userRole]);

  const renderContent = () => {
    if (userRole === 'buyer') {
      switch (activeTab) {
        case 'shop': return <BuyerShop />;
        case 'orders': return <OrdersPage />;
        case 'profile': return <BuyerProfilePage />;
        default: return <BuyerShop />;
      }
    }
    
    if (userRole === 'farmer') {
      switch (activeTab) {
        case 'dashboard': return <FarmerDashboard />;
        case 'listings': return <ListingsPage />;
        case 'add': return <AddListing />;
        case 'profile': return <FarmerProfilePage />;
        default: return <FarmerDashboard />;
      }
    }

    // Admin role
    switch (activeTab) {
      case 'analytics': return <AdminAnalytics />;
      case 'users': return <UsersPage />;
      case 'logistics': return <LogisticsPage />;
      case 'profile': return <AdminProfilePage />;
      default: return <AdminAnalytics />;
    }
  };

  return (
    <MobileLayout>
      {/* Main Content */}
      <div className="min-h-screen">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole!}
      />
    </MobileLayout>
  );
};
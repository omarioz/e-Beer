import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusChip } from '@/components/common/StatusChip';
import { useTranslation } from 'react-i18next';
import { Plus, MoreVertical, ShoppingBasket, Edit, Pause, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Listing {
  id: string;
  name: string;
  quantity: number;
  price_per_kg: number;
  min_price: number;
  location: string;
  harvest_date?: string;
  is_active: boolean;
  has_orders: boolean;
  created_at: string;
  farmer: string;
}

export const ListingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [showNewListingDialog, setShowNewListingDialog] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBidsDialog, setShowBidsDialog] = useState(false);
  const [selectedListingForBids, setSelectedListingForBids] = useState<Listing | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [newListing, setNewListing] = useState({
    name: '',
    quantity: '',
    price: '',
    harvestDate: '',
    organic: false,
    description: ''
  });

  // Load listings from API
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProduce();
      if (response.error) {
        toast.error(response.error);
      } else {
        setListings(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return listing.is_active && !listing.has_orders;
    if (activeTab === 'paused') return !listing.is_active && !listing.has_orders;
    if (activeTab === 'sold') return listing.has_orders;
    return true;
  });

  const handleSelectListing = (id: string, checked: boolean) => {
    setSelectedListings(prev =>
      checked ? [...prev, id] : prev.filter(listingId => listingId !== id)
    );
  };

  const handleBulkAction = (action: 'pause' | 'activate' | 'sold') => {
    console.log(`Bulk ${action} for listings:`, selectedListings);
    setSelectedListings([]);
  };

  const handleListingAction = (id: string, action: 'edit' | 'pause' | 'sold' | 'delete' | 'bids') => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;

    if (action === 'edit') {
      setEditingListing(listing);
      setShowEditDialog(true);
    } else if (action === 'pause') {
      handleToggleListingStatus(id, !listing.is_active);
    } else if (action === 'sold') {
      handleToggleListingStatus(id, false); // Mark as sold (inactive)
    } else if (action === 'delete') {
      handleDeleteListing(id);
    } else if (action === 'bids') {
      setSelectedListingForBids(listing);
      setShowBidsDialog(true);
      loadBidsForListing(id);
    }
  };

  const loadBidsForListing = async (listingId: string) => {
    try {
      const response = await apiClient.getProduceBids(listingId);
      if (response.error) {
        toast.error(response.error);
      } else {
        // Directly set the bids returned from the API
        setBids(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bids');
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      console.log('Accepting bid:', bidId);
      
      // Find the bid to check its status
      const bid = bids.find(b => b.id === bidId);
      if (!bid) {
        toast.error('Bid not found');
        return;
      }
      
      if (bid.status !== 'pending') {
        toast.error(`Cannot accept bid with status: ${bid.status}`);
        return;
      }
      
      const response = await apiClient.acceptBid(bidId);
      console.log('Accept bid response:', response);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Bid accepted! Order created successfully.');
        await loadBidsForListing(selectedListingForBids!.id);
        loadListings(); // Refresh listings
      }
    } catch (error: any) {
      console.error('Accept bid error:', error);
      toast.error(error.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      console.log('Rejecting bid:', bidId);
      
      // Find the bid to check its status
      const bid = bids.find(b => b.id === bidId);
      if (!bid) {
        toast.error('Bid not found');
        return;
      }
      
      if (bid.status !== 'pending') {
        toast.error(`Cannot reject bid with status: ${bid.status}`);
        return;
      }
      
      const response = await apiClient.rejectBid(bidId);
      console.log('Reject bid response:', response);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Bid rejected.');
        loadBidsForListing(selectedListingForBids!.id);
      }
    } catch (error: any) {
      console.error('Reject bid error:', error);
      toast.error(error.message || 'Failed to reject bid');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.deleteProduce(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Listing deleted successfully!');
        loadListings(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const handleToggleListingStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await apiClient.updateProduce(id, { is_active: isActive });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(`Listing ${isActive ? 'activated' : 'paused'} successfully!`);
        loadListings(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
    }
  };

  const handleUpdateListing = async () => {
    if (!editingListing) return;

    try {
      const updateData = {
        name: editingListing.name,
        quantity: editingListing.quantity,
        price_per_kg: editingListing.price_per_kg,
        min_price: editingListing.min_price,
        location: editingListing.location,
        harvest_date: editingListing.harvest_date,
      };

      const response = await apiClient.updateProduce(editingListing.id, updateData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Listing updated successfully!');
        setShowEditDialog(false);
        setEditingListing(null);
        loadListings(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
    }
  };

  const handleCreateListing = async () => {
    try {
      const produceData = {
        name: newListing.name,
        quantity: parseFloat(newListing.quantity),
        price_per_kg: parseFloat(newListing.price),
        min_price: parseFloat(newListing.price),
        location: 'Hargeisa', // Default location
        harvest_date: newListing.harvestDate || undefined,
      };

      const response = await apiClient.createProduce(produceData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Listing created successfully!');
    setShowNewListingDialog(false);
    setNewListing({
      name: '',
      quantity: '',
      price: '',
      harvestDate: '',
      organic: false,
      description: ''
    });
        loadListings(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing');
    }
  };

  const renderListingCard = (listing: Listing) => (
    <div key={listing.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={selectedListings.includes(listing.id)}
          onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
        />
        
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          <ShoppingBasket className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{listing.name}</h3>
              <p className="text-sm text-muted-foreground">
                {listing.quantity}kg • ${listing.price_per_kg}/kg
              </p>
              <p className="text-xs text-muted-foreground">
                Location: {listing.location}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <StatusChip status={
                listing.has_orders ? 'sold' : 
                listing.is_active ? 'active' : 'paused'
              } />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'bids')}>
                    <ShoppingBasket className="w-4 h-4 mr-2" />
                    View Bids
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'edit')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'pause')}>
                    <Pause className="w-4 h-4 mr-2" />
                    {listing.is_active ? 'Pause' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'sold')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Sold
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleListingAction(listing.id, 'delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Header title={t('farmer.listings')} showLogo={false} />

      <div className="p-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>

          {/* Bulk Actions */}
          {selectedListings.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedListings.length} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('pause')}
                >
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('sold')}
                >
                  Mark Sold
                </Button>
              </div>
            </div>
          )}

          {/* Listings */}
          <TabsContent value={activeTab} className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading listings...</div>
              </div>
            ) : filteredListings.length > 0 ? (
              filteredListings.map(renderListingCard)
            ) : (
              <EmptyState
                illustration={<ShoppingBasket className="w-12 h-12" />}
                title="No listings found"
                description={
                  activeTab === 'all'
                    ? "Add your first listing to start selling"
                    : `No ${activeTab} listings`
                }
                cta={activeTab === 'all' ? "Add Listing" : undefined}
                onAction={() => setShowNewListingDialog(true)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <Dialog open={showNewListingDialog} onOpenChange={setShowNewListingDialog}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('farmer.newListing')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="listing-name">Produce Name</Label>
                <Input
                  id="listing-name"
                  value={newListing.name}
                  onChange={(e) => setNewListing(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per kg</Label>
                  <Input
                    id="price"
                    value={newListing.price}
                    onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2.50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="harvest-date">Harvest Date</Label>
                <Input
                  id="harvest-date"
                  type="date"
                  value={newListing.harvestDate}
                  onChange={(e) => setNewListing(prev => ({ ...prev, harvestDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newListing.description}
                  onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your produce..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="organic"
                  checked={newListing.organic}
                  onCheckedChange={(checked) => setNewListing(prev => ({ ...prev, organic: checked }))}
                />
                <Label htmlFor="organic">Organic Certification</Label>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewListingDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateListing}>
                  Create Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Listing Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
            </DialogHeader>
            {editingListing && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Produce Name</Label>
                  <Input
                    id="edit-name"
                    value={editingListing.name}
                    onChange={(e) => setEditingListing(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="e.g., Fresh Tomatoes"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-quantity">Quantity (kg)</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      value={editingListing.quantity}
                      onChange={(e) => setEditingListing(prev => prev ? { ...prev, quantity: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price per kg</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editingListing.price_per_kg}
                      onChange={(e) => setEditingListing(prev => prev ? { ...prev, price_per_kg: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="2.50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingListing.location}
                    onChange={(e) => setEditingListing(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder="Hargeisa"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-harvest-date">Harvest Date</Label>
                  <Input
                    id="edit-harvest-date"
                    type="date"
                    value={editingListing.harvest_date || ''}
                    onChange={(e) => setEditingListing(prev => prev ? { ...prev, harvest_date: e.target.value } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editingListing.is_active}
                    onCheckedChange={(checked) => setEditingListing(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label htmlFor="edit-active">Active Listing</Label>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleUpdateListing}>
                    Update Listing
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bids Dialog */}
        <Dialog open={showBidsDialog} onOpenChange={setShowBidsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bids for {selectedListingForBids?.name}</DialogTitle>
            </DialogHeader>
            {selectedListingForBids && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium">Listing Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedListingForBids.quantity}kg • ${selectedListingForBids.price_per_kg}/kg • {selectedListingForBids.location}
                  </p>
                </div>

                {bids.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Received Bids</h4>
                    {bids.map((bid) => (
                      <div key={bid.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">${bid.bid_price}/kg</p>
                            <p className="text-sm text-muted-foreground">
                              Bidder: {bid.buyer_name || 'Anonymous'} • {new Date(bid.created_at).toLocaleDateString()}
                            </p>
                            {bid.status && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bid.status}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {bid.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectBid(bid.id)}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptBid(bid.id)}
                                >
                                  Accept
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No bids received for this listing yet
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowBidsDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
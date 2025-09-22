import React, { useState } from 'react';
import { Camera, Upload, MapPin, Calendar } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ListingForm {
  productName: string;
  category: string;
  quantity: string;
  unit: string;
  minPrice: string;
  harvestDate: string;
  location: string;
  description: string;
  image: File | null;
}

const CATEGORIES = ['Fruits', 'Vegetables', 'Grains', 'Herbs', 'Legumes'];
const UNITS = ['kg', 'bunch', 'bag', 'box', 'piece'];

export const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ListingForm>({
    productName: '',
    category: 'Fruits',
    quantity: '',
    unit: 'kg',
    minPrice: '',
    harvestDate: '',
    location: '',
    description: '',
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert form data to API format
      const produceData = {
        name: form.productName,
        quantity: parseFloat(form.quantity),
        price_per_kg: parseFloat(form.minPrice),
        min_price: parseFloat(form.minPrice),
        location: form.location,
        harvest_date: form.harvestDate || undefined,
      };

      const response = await apiClient.createProduce(produceData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Produce listing created successfully!');
        navigate('/farmer/listings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Add New Listing" showBack />
      
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Product Photo</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 bg-card border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {form.image ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{form.image.name}</p>
                  <p className="text-xs text-success">Photo uploaded</p>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to add photo</p>
                  <p className="text-xs text-muted-foreground">Works offline - uploads when connected</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Product Name</label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => setForm(prev => ({ ...prev, productName: e.target.value }))}
            placeholder="e.g., Fresh Tomatoes"
            className="w-full px-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        {/* Category & Quantity Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quantity</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="25"
                className="flex-1 px-3 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <select
                value={form.unit}
                onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                className="px-3 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Minimum Price */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Minimum Price (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              step="0.01"
              value={form.minPrice}
              onChange={(e) => setForm(prev => ({ ...prev, minPrice: e.target.value }))}
              placeholder="2.50"
              className="w-full pl-8 pr-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        {/* Harvest Date & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Harvest Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="date"
                value={form.harvestDate}
                onChange={(e) => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Hargeisa"
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description (Optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Tell buyers about your produce quality, farming methods..."
            rows={3}
            className="w-full px-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full btn-primary flex items-center justify-center space-x-2",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              <span>Creating Listing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Create Listing</span>
            </>
          )}
        </button>

        {/* Offline Notice */}
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your listing will be saved locally and uploaded when you're back online
          </p>
        </div>
      </form>
    </div>
  );
};
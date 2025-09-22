import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useTranslation } from 'react-i18next';
import { useAuthActions } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Wallet, History, Globe, Bell, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockPayoutHistory = [
  { date: '2024-08-01', amount: '$125.50', method: 'Mobile Money', status: 'Completed' },
  { date: '2024-07-28', amount: '$89.30', method: 'Mobile Money', status: 'Completed' },
  { date: '2024-07-25', amount: '$234.75', method: 'Mobile Money', status: 'Pending' },
];

export const BuyerProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, switchRole } = useAuthActions();
  const [profile, setProfile] = useState({
    name: '',
    phone_number: '',
    region: 'Mogadishu',
    avatar: '',
    email_notifications: true,
    language: 'en'
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const walletBalance = 347.25;

  // Load user profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProfile();
      if (response.error) {
        toast.error(response.error);
      } else {
        setProfile(prev => ({
          ...prev,
          name: response.data.name || '',
          phone_number: response.data.phone_number || '',
          region: response.data.region || 'Mogadishu',
          email_notifications: response.data.email_notifications ?? true,
          language: response.data.language || 'en',
        }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.updateProfile({
        name: profile.name,
        phone_number: profile.phone_number,
        region: profile.region,
        email_notifications: profile.email_notifications,
        language: profile.language
      });
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Profile updated successfully!');
        // Reload profile to get updated data
        await loadProfile();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setProfile(prev => ({ ...prev, language: lang }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Header title={t('buyer.profile')} showLogo={false} />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 cursor-pointer">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-muted-foreground">Buyer</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone_number}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+252 61 234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={profile.region}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mogadishu">Mogadishu</SelectItem>
                      <SelectItem value="Bay">Bay</SelectItem>
                      <SelectItem value="Hargeisa">Hargeisa</SelectItem>
                      <SelectItem value="Gedo">Gedo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={saveProfile} 
                disabled={isSaving}
                className="min-w-24"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Payout History</DialogTitle>
                  </DialogHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayoutHistory.map((payout, index) => (
                        <TableRow key={index}>
                          <TableCell>{payout.date}</TableCell>
                          <TableCell>{payout.amount}</TableCell>
                          <TableCell>{payout.method}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payout.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payout.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-primary">${walletBalance.toFixed(2)}</p>
              </div>
              <Button size="sm">Request Payout</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={profile.email_notifications}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sms: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <Label>Language</Label>
              </div>
              <Select value={profile.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="so">Somali</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={switchRole}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Switch Role
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
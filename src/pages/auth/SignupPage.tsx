import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { User, ShoppingCart } from 'lucide-react';

interface SignupForm {
  phone_number: string;
  password: string;
  password2: string;
  name: string;
  role: UserRole;
}

export const SignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { register: registerUser, setRole } = useAuth();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }

    if (data.password !== data.password2) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerUser({
        username: data.phone_number, // Use phone_number as username
        email: data.phone_number, // Use phone_number as email for now
        password: data.password,
        password2: data.password2,
        name: data.name,
        role: selectedRole,
        phone_number: data.phone_number, // Add phone_number field
      });
      
      toast.success('Account created successfully!');
      navigate(`/${user.role}`, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'buyer' as UserRole,
      title: 'Buyer',
      description: 'Purchase fresh agricultural products',
      icon: ShoppingCart,
    },
    {
      id: 'farmer' as UserRole,
      title: 'Farmer',
      description: 'Sell your produce directly to buyers',
      icon: User,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/e8911162-0401-434a-9d62-592829f50321.png" 
            alt="e-Beer" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join the agricultural marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <Label>Choose your role</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setValue('role', role.id);
                      }}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <div className="font-medium text-sm">{role.title}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+1234567890"
                {...register('phone_number', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="mt-1"
              />
              {errors.phone_number && (
                <p className="text-destructive text-sm mt-1">{errors.phone_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                {...register('password2', { 
                  required: 'Please confirm your password',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="mt-1"
              />
              {errors.password2 && (
                <p className="text-destructive text-sm mt-1">{errors.password2.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
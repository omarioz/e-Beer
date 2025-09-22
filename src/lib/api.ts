// API client for Django backend integration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user_id?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  name: string;
  role: string;
  phone_number: string;
}

interface ProfileData {
  name: string;
  phone_number?: string;
  region?: string;
  email_notifications?: boolean;
  language?: string;
}

interface ProduceData {
  name: string;
  quantity: number;
  price_per_kg: number;
  min_price: number;
  location: string;
  harvest_date?: string;
  is_active?: boolean;
}

interface BidData {
  produce: string;
  bid_price: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('access_token');
  }

  private formatError(data: any): string {
    // Handle Django validation errors
    if (typeof data === 'object' && data !== null) {
      // Check for specific field errors (like password validation)
      const fieldErrors: string[] = [];
      
      for (const [field, errors] of Object.entries(data)) {
        if (Array.isArray(errors)) {
          fieldErrors.push(`${field}: ${errors.join(', ')}`);
        } else if (typeof errors === 'string') {
          fieldErrors.push(`${field}: ${errors}`);
        }
      }
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
      
      // Check for general error messages
      if (data.detail) {
        return data.detail;
      }
      
      if (data.error) {
        return data.error;
      }
    }
    
    return 'Request failed';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : this.formatError(data),
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.data) {
      this.token = response.data.access;
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse> {
    const response = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<LoginResponse>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.data) {
      this.token = response.data.access;
      localStorage.setItem('access_token', response.data.access);
    }

    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse> {
    return this.request('/profile/current_user/');
  }

  async createProfile(profileData: ProfileData): Promise<ApiResponse> {
    return this.request('/profile/create_profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(profileData: ProfileData): Promise<ApiResponse> {
    // First get the current profile to get the ID
    const profileResponse = await this.getProfile();
    if (profileResponse.error) {
      return profileResponse;
    }
    
    const profileId = profileResponse.data.id;
    return this.request(`/profile/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Produce methods
  async getProduce(): Promise<ApiResponse> {
    return this.request('/produce/');
  }

  async createProduce(produceData: ProduceData): Promise<ApiResponse> {
    return this.request('/produce/', {
      method: 'POST',
      body: JSON.stringify(produceData),
    });
  }

  async updateProduce(id: string, produceData: Partial<ProduceData>): Promise<ApiResponse> {
    return this.request(`/produce/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(produceData),
    });
  }

  async deleteProduce(id: string): Promise<ApiResponse> {
    return this.request(`/produce/${id}/`, {
      method: 'DELETE',
    });
  }

  // Bid methods
  async getBids(): Promise<ApiResponse> {
    return this.request('/bids/');
  }

  async getProduceBids(produceId: string): Promise<ApiResponse> {
    return this.request(`/produce/${produceId}/bids/`);
  }

  async createBid(bidData: BidData): Promise<ApiResponse> {
    return this.request('/bids/', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async acceptBid(id: string): Promise<ApiResponse> {
    console.log('API: Accepting bid with ID:', id);
    const response = await this.request(`/bids/${id}/accept/`, {
      method: 'POST',
    });
    console.log('API: Accept bid response:', response);
    return response;
  }

  async rejectBid(id: string): Promise<ApiResponse> {
    console.log('API: Rejecting bid with ID:', id);
    const response = await this.request(`/bids/${id}/reject/`, {
      method: 'POST',
    });
    console.log('API: Reject bid response:', response);
    return response;
  }

  // Order methods
  async getOrders(): Promise<ApiResponse> {
    return this.request('/orders/');
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
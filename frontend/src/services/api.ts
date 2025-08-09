import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const DEFAULT_CONTRACTOR_ID = 1;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PricingData {
  good_tier_price: number;
  good_tier_name: string;
  good_tier_warranty: string;
  better_tier_price: number;
  better_tier_name: string;
  better_tier_warranty: string;
  best_tier_price: number;
  best_tier_name: string;
  best_tier_warranty: string;
  removal_price: number;
  permit_price: number;
}

export interface BrandingData {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url?: string;
}

export interface TemplateData {
  header_text: string;
  footer_text: string;
  show_warranty: boolean;
  show_financing: boolean;
  show_testimonials: boolean;
  custom_message?: string;
  terms_conditions?: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address: string;
  status: string;
  source: string;
  notes?: string;
  contractor_id: number;
  created_at: string;
  updated_at?: string;
  latest_quote?: {
    id: number;
    total_price: number;
    selected_tier: string;
    roof_size_sqft: number;
    price_per_sqft: number;
    created_at: string;
  };
}

export interface DashboardStats {
  period: string;
  summary: {
    total_leads: number;
    new_leads: number;
    total_quotes: number;
    total_value: number;
    average_quote_value: number;
  };
  lead_status: Record<string, number>;
  quote_tiers: Record<string, number>;
  widget_events: Record<string, number>;
}

export const pricingAPI = {
  get: async (contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.get(`/pricing/contractor/${contractorId}`);
    return response.data;
  },
  update: async (data: Partial<PricingData>, contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.put(`/pricing/contractor/${contractorId}`, data);
    return response.data;
  },
};

export const brandingAPI = {
  get: async (contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.get(`/branding/contractor/${contractorId}`);
    return response.data;
  },
  update: async (data: Partial<BrandingData>, contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.put(`/branding/contractor/${contractorId}`, data);
    return response.data;
  },
  uploadLogo: async (file: File, contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/branding/contractor/${contractorId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const templateAPI = {
  get: async (contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.get(`/templates/contractor/${contractorId}`);
    return response.data;
  },
  update: async (data: Partial<TemplateData>, contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.put(`/templates/contractor/${contractorId}`, data);
    return response.data;
  },
  preview: async (contractorId: number = DEFAULT_CONTRACTOR_ID) => {
    const response = await api.get(`/templates/contractor/${contractorId}/preview`);
    return response.data;
  },
};

export const leadAPI = {
  getContractorLeads: async (contractorId: number = DEFAULT_CONTRACTOR_ID, params?: {
    skip?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get<Lead[]>(`/leads/contractor/${contractorId}`, { params });
    return response.data;
  },
  getLead: async (leadId: number) => {
    const response = await api.get<Lead>(`/leads/${leadId}`);
    return response.data;
  },
  updateLead: async (leadId: number, data: Partial<Lead>) => {
    const response = await api.put<Lead>(`/leads/${leadId}`, data);
    return response.data;
  },
  deleteLead: async (leadId: number) => {
    const response = await api.delete(`/leads/${leadId}`);
    return response.data;
  },
  exportLeads: async (contractorId: number = DEFAULT_CONTRACTOR_ID, status?: string) => {
    const response = await api.get(`/leads/contractor/${contractorId}/export`, {
      params: { status },
      responseType: 'blob',
    });
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboardStats: async (contractorId: number = DEFAULT_CONTRACTOR_ID, days: number = 30) => {
    const response = await api.get<DashboardStats>(`/analytics/contractor/${contractorId}/dashboard`, {
      params: { days }
    });
    return response.data;
  },
  getRecentLeads: async (contractorId: number = DEFAULT_CONTRACTOR_ID, limit: number = 5) => {
    const response = await api.get<Lead[]>(`/leads/contractor/${contractorId}`, {
      params: { limit, skip: 0 }
    });
    return response.data;
  },
};

export default api;
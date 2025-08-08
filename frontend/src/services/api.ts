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

export default api;
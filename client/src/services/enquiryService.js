import api from './api';

export const getEnquiries = async (params) => {
  const response = await api.get('/enquiries', { params });
  return response.data;
};

export const getEnquiryById = async (id) => {
  const response = await api.get(`/enquiries/${id}`);
  return response.data;
};

export const createEnquiry = async (enquiryData) => {
  const response = await api.post('/enquiries', enquiryData);
  return response.data;
};

export const replyEnquiry = async (id, messageData) => {
  const response = await api.post(`/enquiries/${id}/reply`, messageData);
  return response.data;
};

export const escalateEnquiry = async (id, escalateData) => {
  const response = await api.post(`/enquiries/${id}/escalate`, escalateData);
  return response.data;
};

export const updateEnquiryStatus = async (id, statusData) => {
  const response = await api.put(`/enquiries/${id}/status`, statusData);
  return response.data;
};

import api from './api';

export const getComplaints = async (params) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (data) => {
  const response = await api.post('/complaints', data);
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);
  return response.data;
};

export const addComplaintMessage = async (id, messageData) => {
  const response = await api.post(`/complaints/${id}/messages`, messageData);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};


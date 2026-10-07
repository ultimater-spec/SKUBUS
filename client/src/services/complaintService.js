import axios from 'axios';

const API_URL = 'http://localhost:5000/api/complaints';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getComplaints = async (params) => {
  const response = await api.get('/', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createComplaint = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

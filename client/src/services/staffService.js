import axios from 'axios';

const API_URL = 'http://localhost:5000/api/staff';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getStaff = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getStaffById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post('/', staffData);
  return response.data;
};

export const updateStaff = async (id, staffData) => {
  const response = await api.put(`/${id}`, staffData);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

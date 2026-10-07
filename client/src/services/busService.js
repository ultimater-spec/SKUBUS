import axios from 'axios';

const API_URL = 'http://localhost:5000/api/buses';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getBuses = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getBusById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createBus = async (busData) => {
  const response = await api.post('/', busData);
  return response.data;
};

export const updateBus = async (id, busData) => {
  const response = await api.put(`/${id}`, busData);
  return response.data;
};

export const deleteBus = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

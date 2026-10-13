import api from './api';

export const getBuses = async () => {
  const response = await api.get('/buses');
  return response.data;
};

export const getBusById = async (id) => {
  const response = await api.get(`/buses/${id}`);
  return response.data;
};

export const createBus = async (busData) => {
  const response = await api.post('/buses', busData);
  return response.data;
};

export const updateBus = async (id, busData) => {
  const response = await api.put(`/buses/${id}`, busData);
  return response.data;
};

export const deleteBus = async (id) => {
  const response = await api.delete(`/buses/${id}`);
  return response.data;
};


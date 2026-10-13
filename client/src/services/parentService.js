import api from './api';

export const getParents = async () => {
  const response = await api.get('/parents');
  return response.data;
};

export const getParentById = async (id) => {
  const response = await api.get(`/parents/${id}`);
  return response.data;
};

export const createParent = async (parentData) => {
  const response = await api.post('/parents', parentData);
  return response.data;
};

export const updateParent = async (id, parentData) => {
  const response = await api.put(`/parents/${id}`, parentData);
  return response.data;
};

export const deleteParent = async (id) => {
  const response = await api.delete(`/parents/${id}`);
  return response.data;
};


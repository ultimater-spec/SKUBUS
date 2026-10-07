import axios from 'axios';

const API_URL = 'http://localhost:5000/api/parents';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getParents = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getParentById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createParent = async (parentData) => {
  const response = await api.post('/', parentData);
  return response.data;
};

export const updateParent = async (id, parentData) => {
  const response = await api.put(`/${id}`, parentData);
  return response.data;
};

export const deleteParent = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

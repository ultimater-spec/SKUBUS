import axios from 'axios';

const API_URL = 'http://localhost:5000/api/routes';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getRoutes = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getRouteById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createRoute = async (routeData) => {
  const response = await api.post('/', routeData);
  return response.data;
};

export const updateRoute = async (id, routeData) => {
  const response = await api.put(`/${id}`, routeData);
  return response.data;
};

export const deleteRoute = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

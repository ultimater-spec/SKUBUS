import api from './api';

export const getRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

export const getRouteById = async (id) => {
  const response = await api.get(`/routes/${id}`);
  return response.data;
};

export const createRoute = async (routeData) => {
  const response = await api.post('/routes', routeData);
  return response.data;
};

export const updateRoute = async (id, routeData) => {
  const response = await api.put(`/routes/${id}`, routeData);
  return response.data;
};

export const deleteRoute = async (id) => {
  const response = await api.delete(`/routes/${id}`);
  return response.data;
};


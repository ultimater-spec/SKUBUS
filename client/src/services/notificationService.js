import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getNotifications = async () => {
  const response = await api.get('/');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/mark-all-read');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

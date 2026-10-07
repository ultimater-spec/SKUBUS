import axios from 'axios';

const API_URL = 'http://localhost:5000/api/attendance';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getAttendance = async (params) => {
  const response = await api.get('/', { params });
  return response.data;
};

export const getAttendanceById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const markAttendance = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

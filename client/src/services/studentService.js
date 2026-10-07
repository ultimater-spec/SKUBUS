import axios from 'axios';

// The axios interceptor with credentials should be set up globally, but we can rely on existing auth logic 
// or standard axios setup. Assuming `api` from standard axios setup.
// Let's create an axios instance with base config if needed, or just use axios with withCredentials.
const API_URL = 'http://localhost:5000/api/students';

// Using standard axios with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies
});

export const getStudents = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/', studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export const registerFace = async (id, faceData) => {
  const response = await api.post(`/${id}/face/register`, faceData);
  return response.data;
};

export const validateFace = async (id, imageData) => {
  const response = await api.post(`/${id}/face/validate`, { image: imageData });
  return response.data;
};

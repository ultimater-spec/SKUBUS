import api from './api';

export const getTickets = async (params) => {
  const response = await api.get('/tickets', { params });
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const replyTicket = async (id, messageData) => {
  const response = await api.post(`/tickets/${id}/reply`, messageData);
  return response.data;
};

export const updateTicketStatus = async (id, statusData) => {
  const response = await api.put(`/tickets/${id}/status`, statusData);
  return response.data;
};

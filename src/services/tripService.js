import { apiClient } from './api';
import { trips as initialTrips } from '../data/trips';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const tripService = {
  async getTrips() {
    try {
      const response = await apiClient.get('/trips');
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialTrips;
    }
  },

  async getTripById(id) {
    try {
      const response = await apiClient.get(`/trips/${id}`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialTrips.find((t) => t.id === id || t._id === id) || null;
    }
  },

  async getFeaturedTrip() {
    try {
      const trips = await this.getTrips();
      return trips[0] || initialTrips[0];
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialTrips[0];
    }
  },
};

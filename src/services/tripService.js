import { apiClient } from './api';
import { trips as initialTrips } from '../data/trips';

/**
 * ==============================================================================
 * Trip Service (Frontend API Layer)
 * ==============================================================================
 * Connects to `/api/trips` with fallback to local wander narratives.
 */

export const tripService = {
  async getTrips() {
    try {
      const response = await apiClient.get('/trips');
      return response.data || response;
    } catch {
      return initialTrips;
    }
  },

  async getTripById(id) {
    try {
      const response = await apiClient.get(`/trips/${id}`);
      return response.data || response;
    } catch {
      return initialTrips.find((t) => t.id === id || t._id === id) || null;
    }
  },

  async getFeaturedTrip() {
    try {
      const trips = await this.getTrips();
      return trips[0] || initialTrips[0];
    } catch {
      return initialTrips[0];
    }
  },
};

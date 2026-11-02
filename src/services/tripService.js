import { trips as initialTrips } from '../data/trips';

export const tripService = {
  async getTrips() {
    await new Promise((res) => setTimeout(res, 40));
    return initialTrips;
  },

  async getTripById(id) {
    await new Promise((res) => setTimeout(res, 30));
    return initialTrips.find((t) => t.id === id) || null;
  },

  async getFeaturedTrip() {
    return initialTrips[0];
  },
};


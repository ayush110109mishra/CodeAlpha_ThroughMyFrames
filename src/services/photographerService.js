import { apiClient } from './api';
import { photographerData } from '../data/photographer';
import { frames } from '../data/frames';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const photographerService = {
  async getPhotographerInfo() {
    try {
      const response = await apiClient.get('/photographer');
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      const favoriteFrames = frames.filter((f) =>
        photographerData.favoriteFrameIds.includes(f.id)
      );
      return {
        ...photographerData,
        favoriteFrames,
      };
    }
  },

  async submitContact(formData) {
    try {
      const response = await apiClient.post('/photographer/contact', formData);
      return response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return {
        success: true,
        message: 'Your letter has reached Ayush. You will receive a response shortly.',
      };
    }
  },
};

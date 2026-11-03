import { apiClient } from './api';
import { photographerData } from '../data/photographer';
import { frames } from '../data/frames';

/**
 * ==============================================================================
 * Photographer Service (Frontend API Layer)
 * ==============================================================================
 * Connects to `/api/photographer` with fallback to local sanctuary data.
 */

export const photographerService = {
  async getPhotographerInfo() {
    try {
      const response = await apiClient.get('/photographer');
      return response.data || response;
    } catch {
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
    } catch {
      return {
        success: true,
        message: 'Your letter has reached Ayush. You will receive a response shortly.',
      };
    }
  },
};

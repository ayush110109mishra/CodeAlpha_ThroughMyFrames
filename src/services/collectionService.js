import { apiClient } from './api';
import { collections as initialCollections } from '../data/collections';
import { frames } from '../data/frames';

/**
 * ==============================================================================
 * Collection Service (Frontend API Layer - Phase 4)
 * ==============================================================================
 * Connects to `/api/collections`. Mock fallback ONLY when VITE_USE_MOCK=true.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const collectionService = {
  async getCollections(params = {}) {
    try {
      const response = await apiClient.get('/collections', { params });
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialCollections;
    }
  },

  async getCollectionById(id) {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      const collection = initialCollections.find((c) => c.id === id || c._id === id);
      if (!collection) return null;
      const collectionFrames = frames.filter((f) => collection.frameIds?.includes(f.id));
      return {
        ...collection,
        frames: collectionFrames,
      };
    }
  },

  async getFeaturedCollections(limit = 3) {
    try {
      const all = await this.getCollections();
      return all.slice(0, limit);
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialCollections.slice(0, limit);
    }
  },

  async createCollection(data) {
    const response = await apiClient.post('/collections', data);
    return response.data || response;
  },

  async updateCollection(id, data) {
    const response = await apiClient.put(`/collections/${id}`, data);
    return response.data || response;
  },

  async toggleFrame(collectionId, frameId) {
    const response = await apiClient.post(`/collections/${collectionId}/frames`, { frameId });
    return response.data || response;
  },

  async deleteCollection(id) {
    const response = await apiClient.delete(`/collections/${id}`);
    return response.data || response;
  },
};

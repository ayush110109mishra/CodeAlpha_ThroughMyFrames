import { apiClient } from './api';
import { collections as initialCollections } from '../data/collections';
import { frames } from '../data/frames';

/**
 * ==============================================================================
 * Collection Service (Frontend API Layer)
 * ==============================================================================
 * Connects to `/api/collections` with fallback to local curated albums.
 */

export const collectionService = {
  async getCollections() {
    try {
      const response = await apiClient.get('/collections');
      return response.data || response;
    } catch {
      return initialCollections;
    }
  },

  async getCollectionById(id) {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      return response.data || response;
    } catch {
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
    } catch {
      return initialCollections.slice(0, limit);
    }
  },
};

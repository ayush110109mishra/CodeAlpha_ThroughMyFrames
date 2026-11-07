import { apiClient } from './api';
import { frames as initialFrames } from '../data/frames';
import { storage } from '../lib/utils';

/**
 * ==============================================================================
 * Frame Service (Frontend API Layer - Phase 3)
 * ==============================================================================
 * Connects frontend components to the backend REST API (`/api/frames`).
 * Real API mode is active by default. Mock fallback is ONLY used if VITE_USE_MOCK=true.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const STORAGE_KEY = 'custom_frames';
const LIKES_KEY = 'liked_frames';
const SAVED_KEY = 'saved_frames';

function getLocalFrames() {
  const custom = storage.get(STORAGE_KEY, []);
  return [...custom, ...initialFrames];
}

export const frameService = {
  /**
   * Fetch all frames with optional filters (mood, category, search, author, feed)
   */
  async getFrames({ mood, category, search, author, feed, sort = 'latest', page, limit } = {}) {
    try {
      const params = {};
      if (mood && mood !== 'All') params.mood = mood;
      if (category && category !== 'All') params.category = category;
      if (search && search.trim()) params.search = search.trim();
      if (author) params.author = author;
      if (feed) params.feed = feed;
      if (sort) params.sort = sort;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await apiClient.get('/frames', { params });
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      // Offline fallback only when explicitly enabled
      let list = getLocalFrames();
      if (mood && mood !== 'All') {
        list = list.filter((f) => f.mood.toLowerCase() === mood.toLowerCase());
      }
      if (category && category !== 'All') {
        list = list.filter((f) => f.category.toLowerCase() === category.toLowerCase());
      }
      if (author) {
        list = list.filter((f) => f.author?.username === author);
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(
          (f) =>
            f.moment.toLowerCase().includes(q) ||
            f.location.toLowerCase().includes(q) ||
            f.mood.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q) ||
            f.author?.name?.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  /**
   * Fetch a single frame by its MongoDB _id or customId slug
   */
  async getFrameById(id) {
    try {
      const response = await apiClient.get(`/frames/${id}`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const list = getLocalFrames();
      const frame = list.find((f) => f.id === id || f._id === id);
      if (!frame) return null;
      return frame;
    }
  },

  /**
   * Get featured frames for the landing page
   */
  async getFeaturedFrames(limit = 6) {
    try {
      const frames = await this.getFrames({ limit, sort: 'popular' });
      return frames.slice(0, limit);
    } catch (err) {
      if (!USE_MOCK) throw err;
      return getLocalFrames().slice(0, limit);
    }
  },

  /**
   * Get a random frame (for Moment of the Day / Surprise Me)
   */
  async getRandomFrame(excludeId) {
    try {
      const response = await apiClient.get('/frames/random', {
        params: { excludeId },
      });
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const list = getLocalFrames().filter((f) => f.id !== excludeId);
      if (!list.length) return getLocalFrames()[0];
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
  },

  /**
   * Toggle like count on a frame
   */
  async toggleLike(id) {
    try {
      const response = await apiClient.post(`/frames/${id}/like`);
      const data = response.data || response;
      return data;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const likedList = storage.get(LIKES_KEY, []);
      const isLiked = likedList.includes(id);
      const updated = isLiked ? likedList.filter((item) => item !== id) : [...likedList, id];
      storage.set(LIKES_KEY, updated);
      return { liked: !isLiked };
    }
  },

  /**
   * Toggle bookmark/save state
   */
  async toggleSave(id) {
    try {
      const response = await apiClient.post(`/frames/${id}/save`);
      const data = response.data || response;
      return data;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const savedList = storage.get(SAVED_KEY, []);
      const isSaved = savedList.includes(id);
      const updated = isSaved ? savedList.filter((item) => item !== id) : [...savedList, id];
      storage.set(SAVED_KEY, updated);
      return { saved: !isSaved };
    }
  },

  /**
   * Fetch all saved frames for profile tab
   */
  async getSavedFrames() {
    try {
      const response = await apiClient.get('/users/me/saved');
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      const savedIds = storage.get(SAVED_KEY, []);
      const all = await this.getFrames();
      return all.filter((f) => savedIds.includes(f.id) || savedIds.includes(f._id));
    }
  },

  /**
   * Add a comment to a frame
   */
  async addComment(frameId, { content }) {
    try {
      const response = await apiClient.post(`/frames/${frameId}/comments`, { content });
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const newComment = {
        id: `c_${Date.now()}`,
        author: {
          username: 'ayushmishra',
          name: 'Ayush Mishra',
          avatar: '/images/honey.jpg',
        },
        content,
        createdAt: new Date().toISOString(),
      };
      return newComment;
    }
  },

  /**
   * Delete a comment by ID
   */
  async deleteComment(commentId) {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data || response;
  },

  /**
   * Delete a frame by ID
   */
  async deleteFrame(frameId) {
    const response = await apiClient.delete(`/frames/${frameId}`);
    return response.data || response;
  },

  /**
   * Get comments for a frame
   */
  async getComments(frameId, initialComments = []) {
    try {
      const response = await apiClient.get(`/frames/${frameId}/comments`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return initialComments;
    }
  },

  /**
   * Upload an image to Cloudinary via backend
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data || response;
  },

  /**
   * Create a new frame
   */
  async createFrame(data) {
    const response = await apiClient.post('/frames', data);
    return response.data || response;
  },
};

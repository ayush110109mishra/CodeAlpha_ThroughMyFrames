import { apiClient } from './api';
import { thoughts as initialThoughts } from '../data/thoughts';
import { storage } from '../lib/utils';

/**
 * ==============================================================================
 * Thought Service (Frontend API Layer - Phase 3)
 * ==============================================================================
 * Connects to `/api/thoughts`. Mock fallback ONLY when VITE_USE_MOCK=true.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const STORAGE_KEY = 'custom_thoughts';

function getLocalThoughts() {
  const custom = storage.get(STORAGE_KEY, []);
  return [...custom, ...initialThoughts];
}

export const thoughtService = {
  /**
   * Fetch all thoughts with optional mood and search filtering
   */
  async getThoughts({ mood, author, search } = {}) {
    try {
      const params = {};
      if (mood && mood !== 'All') params.mood = mood;
      if (author) params.author = author;
      if (search && search.trim()) params.search = search.trim();

      const response = await apiClient.get('/thoughts', { params });
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      let list = getLocalThoughts();
      if (mood && mood !== 'All') {
        list = list.filter((t) => t.mood?.toLowerCase() === mood.toLowerCase());
      }
      if (author) {
        list = list.filter((t) => t.author?.username === author);
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.text.toLowerCase().includes(q) ||
            t.author?.name?.toLowerCase().includes(q) ||
            t.mood?.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  /**
   * Fetch single thought by ID or slug
   */
  async getThoughtById(id) {
    try {
      const response = await apiClient.get(`/thoughts/${id}`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      const list = getLocalThoughts();
      return list.find((t) => t.id === id || t._id === id) || null;
    }
  },

  /**
   * Get random thought for reflection widget
   */
  async getRandomThought() {
    try {
      const response = await apiClient.get('/thoughts/random');
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;
      const list = getLocalThoughts();
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
  },

  /**
   * Create a new thought
   */
  async createThought(data) {
    const response = await apiClient.post('/thoughts', data);
    return response.data || response;
  },

  /**
   * Delete a thought
   */
  async deleteThought(id) {
    const response = await apiClient.delete(`/thoughts/${id}`);
    return response.data || response;
  },
};

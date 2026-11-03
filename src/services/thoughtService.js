import { apiClient } from './api';
import { thoughts as initialThoughts } from '../data/thoughts';
import { storage } from '../lib/utils';

/**
 * ==============================================================================
 * Thought Service (Frontend API Layer)
 * ==============================================================================
 * Connects to `/api/thoughts` with resilient offline fallback.
 */

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
    } catch {
      const list = getLocalThoughts();
      return list.find((t) => t.id === id || t._id === id) || null;
    }
  },

  /**
   * Get a random thought
   */
  async getRandomThought(excludeId) {
    try {
      const response = await apiClient.get('/thoughts/random', {
        params: { excludeId },
      });
      return response.data || response;
    } catch {
      const list = getLocalThoughts().filter((t) => t.id !== excludeId);
      if (!list.length) return getLocalThoughts()[0];
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
  },

  /**
   * Create a new thought
   */
  async createThought({ text, mood, tags }) {
    const gradients = [
      'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
      'linear-gradient(135deg, rgba(80, 110, 140, 0.08) 0%, rgba(180, 200, 215, 0.15) 100%)',
      'linear-gradient(135deg, rgba(120, 140, 120, 0.08) 0%, rgba(200, 215, 200, 0.16) 100%)',
      'linear-gradient(135deg, rgba(160, 130, 100, 0.08) 0%, rgba(220, 205, 190, 0.18) 100%)',
    ];
    const bg = gradients[Math.floor(Math.random() * gradients.length)];

    try {
      const response = await apiClient.post('/thoughts', {
        text,
        mood: mood || 'Calm',
        tags: tags || ['Reflections'],
        background: bg,
      });
      return response.data || response;
    } catch (err) {
      const newThought = {
        id: `thought_${Date.now()}`,
        text,
        mood: mood || 'Calm',
        tags: tags || ['Reflections'],
        background: bg,
        author: {
          username: 'ayushmisra',
          name: 'Ayush Misra',
          avatar: '/images/honey.jpg',
        },
        createdAt: new Date().toISOString(),
      };
      const custom = storage.get(STORAGE_KEY, []);
      storage.set(STORAGE_KEY, [newThought, ...custom]);
      return newThought;
    }
  },
};

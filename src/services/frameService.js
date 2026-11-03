import { apiClient } from './api';
import { frames as initialFrames } from '../data/frames';
import { storage } from '../lib/utils';

/**
 * ==============================================================================
 * Frame Service (Frontend API Layer)
 * ==============================================================================
 * Connects frontend components to the backend REST API (`/api/frames`).
 * Preserves exact method signatures and return shapes, with resilient fallback
 * to local mock data if the backend is not yet started.
 */

const STORAGE_KEY = 'custom_frames';
const LIKES_KEY = 'liked_frames';
const SAVED_KEY = 'saved_frames';

function getLocalFrames() {
  const custom = storage.get(STORAGE_KEY, []);
  return [...custom, ...initialFrames];
}

export const frameService = {
  /**
   * Fetch all frames with optional filters (mood, category, search, author)
   */
  async getFrames({ mood, category, search, author, sort = 'latest', page, limit } = {}) {
    try {
      const params = {};
      if (mood && mood !== 'All') params.mood = mood;
      if (category && category !== 'All') params.category = category;
      if (search && search.trim()) params.search = search.trim();
      if (author) params.author = author;
      if (sort) params.sort = sort;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await apiClient.get('/frames', { params });
      return response.data || response;
    } catch (err) {
      // Graceful offline fallback
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
    const likedList = storage.get(LIKES_KEY, []);
    const savedList = storage.get(SAVED_KEY, []);

    try {
      const response = await apiClient.get(`/frames/${id}`);
      const frame = response.data || response;
      return {
        ...frame,
        isLiked: likedList.includes(id) || likedList.includes(frame.id),
        isSaved: savedList.includes(id) || savedList.includes(frame.id),
      };
    } catch (err) {
      const list = getLocalFrames();
      const frame = list.find((f) => f.id === id || f._id === id);
      if (!frame) return null;
      return {
        ...frame,
        isLiked: likedList.includes(id),
        isSaved: savedList.includes(id),
      };
    }
  },

  /**
   * Get featured frames for the landing page
   */
  async getFeaturedFrames(limit = 6) {
    try {
      const frames = await this.getFrames({ limit, sort: 'popular' });
      return frames.slice(0, limit);
    } catch {
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
    const likedList = storage.get(LIKES_KEY, []);
    const isLiked = likedList.includes(id);
    let updated;
    if (isLiked) {
      updated = likedList.filter((item) => item !== id);
    } else {
      updated = [...likedList, id];
    }
    storage.set(LIKES_KEY, updated);

    // Synchronize with API if online
    try {
      await apiClient.post(`/frames/${id}/like`);
    } catch (err) {
      // Non-blocking: local storage holds state
    }

    return { isLiked: !isLiked };
  },

  /**
   * Toggle save (bookmark) state in browser storage
   */
  async toggleSave(id) {
    const savedList = storage.get(SAVED_KEY, []);
    const isSaved = savedList.includes(id);
    let updated;
    if (isSaved) {
      updated = savedList.filter((item) => item !== id);
    } else {
      updated = [...savedList, id];
    }
    storage.set(SAVED_KEY, updated);
    return { isSaved: !isSaved };
  },

  /**
   * Fetch all saved frames for profile tab
   */
  async getSavedFrames() {
    const savedIds = storage.get(SAVED_KEY, []);
    const all = await this.getFrames();
    return all.filter((f) => savedIds.includes(f.id) || savedIds.includes(f._id));
  },

  /**
   * Add a comment to a frame
   */
  async addComment(frameId, { content, author }) {
    try {
      const response = await apiClient.post(`/frames/${frameId}/comments`, {
        content,
        authorId: author?._id,
      });
      return response.data || response;
    } catch (err) {
      const newComment = {
        id: `c_${Date.now()}`,
        author: author || {
          username: 'ayushmisra',
          name: 'Ayush Misra',
          avatar: '/images/honey.jpg',
        },
        content,
        createdAt: new Date().toISOString(),
      };
      const frameCommentsKey = `frame_comments_${frameId}`;
      const existing = storage.get(frameCommentsKey, []);
      storage.set(frameCommentsKey, [newComment, ...existing]);
      return newComment;
    }
  },

  /**
   * Get comments for a frame
   */
  async getComments(frameId, initialComments = []) {
    try {
      const response = await apiClient.get(`/frames/${frameId}/comments`);
      return response.data || response;
    } catch (err) {
      const frameCommentsKey = `frame_comments_${frameId}`;
      const extra = storage.get(frameCommentsKey, []);
      return [...extra, ...initialComments];
    }
  },

  /**
   * Create a new frame
   */
  async createFrame(data) {
    try {
      const response = await apiClient.post('/frames', data);
      return response.data || response;
    } catch (err) {
      const newFrame = {
        id: `frame_${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        ...data,
      };
      const custom = storage.get(STORAGE_KEY, []);
      storage.set(STORAGE_KEY, [newFrame, ...custom]);
      return newFrame;
    }
  },
};

import { frames as initialFrames } from '../data/frames';
import { storage } from '../lib/utils';

const STORAGE_KEY = 'custom_frames';
const LIKES_KEY = 'liked_frames';
const SAVED_KEY = 'saved_frames';

// Initialize in-memory combined frames
function getAllFrames() {
  const custom = storage.get(STORAGE_KEY, []);
  return [...custom, ...initialFrames];
}

export const frameService = {
  async getFrames({ mood, category, search, author } = {}) {
    // Simulate slight async network delay for realistic API behavior
    await new Promise((res) => setTimeout(res, 50));
    let list = getAllFrames();

    if (mood && mood !== 'All') {
      list = list.filter((f) => f.mood.toLowerCase() === mood.toLowerCase());
    }

    if (category && category !== 'All') {
      list = list.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }

    if (author) {
      list = list.filter((f) => f.author.username === author);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.moment.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.mood.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.author.name.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getFrameById(id) {
    await new Promise((res) => setTimeout(res, 30));
    const list = getAllFrames();
    const frame = list.find((f) => f.id === id);
    if (!frame) return null;

    // Check if user has liked or saved this frame locally
    const likedList = storage.get(LIKES_KEY, []);
    const savedList = storage.get(SAVED_KEY, []);

    return {
      ...frame,
      isLiked: likedList.includes(id),
      isSaved: savedList.includes(id),
    };
  },

  async getFeaturedFrames(limit = 6) {
    const list = getAllFrames();
    return list.slice(0, limit);
  },

  async getRandomFrame(excludeId) {
    const list = getAllFrames().filter((f) => f.id !== excludeId);
    if (!list.length) return getAllFrames()[0];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  },

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
    return { isLiked: !isLiked };
  },

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

  async getSavedFrames() {
    const savedIds = storage.get(SAVED_KEY, []);
    const list = getAllFrames();
    return list.filter((f) => savedIds.includes(f.id));
  },

  async addComment(frameId, { content, author }) {
    const newComment = {
      id: `c_${Date.now()}`,
      author: author || {
        username: 'ayushmishra',
        name: 'Ayush Mishra',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      content,
      createdAt: new Date().toISOString(),
    };

    const frameCommentsKey = `frame_comments_${frameId}`;
    const existing = storage.get(frameCommentsKey, []);
    storage.set(frameCommentsKey, [newComment, ...existing]);

    return newComment;
  },

  async getComments(frameId, initialComments = []) {
    const frameCommentsKey = `frame_comments_${frameId}`;
    const extra = storage.get(frameCommentsKey, []);
    return [...extra, ...initialComments];
  },

  async createFrame(data) {
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
  },
};


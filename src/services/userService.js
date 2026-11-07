import { apiClient } from './api';
import { users } from '../data/users';
import { frames } from '../data/frames';
import { thoughts } from '../data/thoughts';
import { collections } from '../data/collections';
import { storage } from '../lib/utils';

/**
 * ==============================================================================
 * User Service (Frontend API Layer - Phase 3)
 * ==============================================================================
 * Connects to `/api/users/:username`, `/api/users/me`, and `/api/users/:username/follow`.
 * Real API mode is active by default. Mock fallback is ONLY used if VITE_USE_MOCK=true.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const FOLLOWING_KEY = 'user_following';

function normalize(str) {
  return (str || '').toLowerCase().replace(/[-_\s]/g, '');
}

function findUser(username) {
  if (!username) return users[0];
  const t = normalize(username);
  const found = users.find((u) => {
    const uNorm = normalize(u.username);
    return uNorm === t || (uNorm === 'ayushmishra' && t === 'ayushmishra');
  });
  return found || users[0];
}

export const userService = {
  getUserByUsernameSync(username) {
    const user = findUser(username);
    const followingList = storage.get(FOLLOWING_KEY, []);
    const isFollowing = followingList.includes(user.username);
    return {
      ...user,
      isFollowing,
    };
  },

  async getUserByUsername(username) {
    try {
      const response = await apiClient.get(`/users/${username}`);
      const payload = response.data || response;
      return payload.user || payload;
    } catch (err) {
      if (!USE_MOCK) throw err;
      return this.getUserByUsernameSync(username);
    }
  },

  async toggleFollow(username) {
    try {
      const response = await apiClient.post(`/users/${username}/follow`);
      return response.data || response;
    } catch (err) {
      if (!USE_MOCK) throw err;

      const user = findUser(username);
      const followingList = storage.get(FOLLOWING_KEY, []);
      const isFollowing = followingList.includes(user.username);
      const updated = isFollowing
        ? followingList.filter((u) => u !== user.username)
        : [...followingList, user.username];
      storage.set(FOLLOWING_KEY, updated);
      return { isFollowing: !isFollowing };
    }
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/users/me', profileData);
    return response.data || response;
  },

  async getMySavedFrames() {
    const response = await apiClient.get('/users/me/saved');
    return response.data || response;
  },

  getUserContentSync(username) {
    const target = normalize(username);
    const userFrames = frames.filter((f) => normalize(f.author?.username) === target);
    const userThoughts = thoughts.filter((t) => normalize(t.author?.username) === target);
    const userCollections = collections.filter((c) => normalize(c.author?.username) === target);

    return {
      frames: userFrames,
      thoughts: userThoughts,
      collections: userCollections,
      saved: [],
    };
  },

  async getUserContent(username) {
    try {
      const response = await apiClient.get(`/users/${username}`);
      const payload = response.data || response;
      return {
        frames: payload.frames || [],
        thoughts: payload.thoughts || [],
        collections: payload.collections || [],
        saved: payload.saved || [],
      };
    } catch (err) {
      if (!USE_MOCK) throw err;
      return this.getUserContentSync(username);
    }
  },
};

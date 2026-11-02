import { users } from '../data/users';
import { frames } from '../data/frames';
import { thoughts } from '../data/thoughts';
import { collections } from '../data/collections';
import { storage } from '../lib/utils';

const FOLLOWING_KEY = 'user_following';

export const userService = {
  async getUserByUsername(username) {
    await new Promise((res) => setTimeout(res, 40));
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;

    const followingList = storage.get(FOLLOWING_KEY, []);
    const isFollowing = followingList.includes(username);

    return {
      ...user,
      isFollowing,
    };
  },

  async getCurrentUser() {
    return users[0]; // Ayush Mishra
  },

  async toggleFollow(username) {
    const followingList = storage.get(FOLLOWING_KEY, []);
    const isFollowing = followingList.includes(username);
    let updated;
    if (isFollowing) {
      updated = followingList.filter((u) => u !== username);
    } else {
      updated = [...followingList, username];
    }
    storage.set(FOLLOWING_KEY, updated);
    return { isFollowing: !isFollowing };
  },

  async getUserContent(username) {
    const userFrames = frames.filter((f) => f.author.username === username);
    const userThoughts = thoughts.filter((t) => t.author.username === username);
    const userCollections = collections.filter((c) => c.author.username === username);

    return {
      frames: userFrames,
      thoughts: userThoughts,
      collections: userCollections,
    };
  },
};


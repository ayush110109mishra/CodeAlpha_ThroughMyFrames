import { users } from '../data/users';
import { frames } from '../data/frames';
import { thoughts } from '../data/thoughts';
import { collections } from '../data/collections';
import { storage } from '../lib/utils';

const FOLLOWING_KEY = 'user_following';

function normalize(str) {
  return (str || '').toLowerCase().replace(/[-_\s]/g, '');
}

function matchesUsername(authorUsername, targetUsername) {
  if (!authorUsername || !targetUsername) return false;
  const a = normalize(authorUsername);
  const t = normalize(targetUsername);
  if (a === t) return true;
  // Handle Ayush Misra / Mishra equivalence
  if ((a === 'ayushmisra' || a === 'ayushmishra') && (t === 'ayushmisra' || t === 'ayushmishra')) {
    return true;
  }
  return false;
}

function findUser(username) {
  if (!username) return users[0];
  const t = normalize(username);
  const found = users.find((u) => {
    const uNorm = normalize(u.username);
    return uNorm === t || matchesUsername(u.username, username);
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
    return this.getUserByUsernameSync(username);
  },

  async getCurrentUser() {
    return users[0]; // Ayush Misra
  },

  async toggleFollow(username) {
    const user = findUser(username);
    const followingList = storage.get(FOLLOWING_KEY, []);
    const isFollowing = followingList.includes(user.username);
    let updated;
    if (isFollowing) {
      updated = followingList.filter((u) => u !== user.username);
    } else {
      updated = [...followingList, user.username];
    }
    storage.set(FOLLOWING_KEY, updated);
    return { isFollowing: !isFollowing };
  },

  getUserContentSync(username) {
    const userFrames = frames.filter((f) => matchesUsername(f.author?.username, username));
    const userThoughts = thoughts.filter((t) => matchesUsername(t.author?.username, username));
    const userCollections = collections.filter((c) => matchesUsername(c.author?.username, username));

    return {
      frames: userFrames,
      thoughts: userThoughts,
      collections: userCollections,
    };
  },

  async getUserContent(username) {
    return this.getUserContentSync(username);
  },
};

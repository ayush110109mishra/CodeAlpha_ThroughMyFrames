import { thoughts as initialThoughts } from '../data/thoughts';
import { storage } from '../lib/utils';

const STORAGE_KEY = 'custom_thoughts';

function getAllThoughts() {
  const custom = storage.get(STORAGE_KEY, []);
  return [...custom, ...initialThoughts];
}

export const thoughtService = {
  async getThoughts({ mood, author, search } = {}) {
    await new Promise((res) => setTimeout(res, 50));
    let list = getAllThoughts();

    if (mood && mood !== 'All') {
      list = list.filter((t) => t.mood.toLowerCase() === mood.toLowerCase());
    }

    if (author) {
      list = list.filter((t) => t.author.username === author);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.text.toLowerCase().includes(q) ||
          t.author.name.toLowerCase().includes(q) ||
          t.mood.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getThoughtById(id) {
    const list = getAllThoughts();
    return list.find((t) => t.id === id) || null;
  },

  async getRandomThought(excludeId) {
    const list = getAllThoughts().filter((t) => t.id !== excludeId);
    if (!list.length) return getAllThoughts()[0];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  },

  async createThought({ text, mood, tags }) {
    const gradients = [
      'linear-gradient(135deg, rgba(194, 105, 62, 0.08) 0%, rgba(233, 201, 168, 0.18) 100%)',
      'linear-gradient(135deg, rgba(80, 110, 140, 0.08) 0%, rgba(180, 200, 215, 0.15) 100%)',
      'linear-gradient(135deg, rgba(120, 140, 120, 0.08) 0%, rgba(200, 215, 200, 0.16) 100%)',
      'linear-gradient(135deg, rgba(110, 90, 150, 0.08) 0%, rgba(210, 190, 230, 0.18) 100%)',
      'linear-gradient(135deg, rgba(200, 140, 80, 0.08) 0%, rgba(240, 210, 180, 0.2) 100%)',
    ];
    const randomBg = gradients[Math.floor(Math.random() * gradients.length)];

    const newThought = {
      id: `thought_${Date.now()}`,
      text,
      mood: mood || 'Calm',
      tags: tags || ['Reflection'],
      background: randomBg,
      createdAt: new Date().toISOString(),
      author: {
        username: 'ayushmisra',
        name: 'Ayush Misra',
        avatar: '/images/honey.jpg',
      },
    };

    const custom = storage.get(STORAGE_KEY, []);
    storage.set(STORAGE_KEY, [newThought, ...custom]);
    return newThought;
  },
};


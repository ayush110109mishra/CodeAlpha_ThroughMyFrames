import { collections as initialCollections } from '../data/collections';
import { frames } from '../data/frames';

export const collectionService = {
  async getCollections() {
    await new Promise((res) => setTimeout(res, 40));
    return initialCollections;
  },

  async getCollectionById(id) {
    await new Promise((res) => setTimeout(res, 30));
    const collection = initialCollections.find((c) => c.id === id);
    if (!collection) return null;

    // Expand frames
    const collectionFrames = frames.filter((f) => collection.frameIds.includes(f.id));
    return {
      ...collection,
      frames: collectionFrames,
    };
  },

  async getFeaturedCollections(limit = 3) {
    return initialCollections.slice(0, limit);
  },
};


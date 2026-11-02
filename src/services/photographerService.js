import { photographerData } from '../data/photographer';
import { frames } from '../data/frames';

export const photographerService = {
  async getPhotographerInfo() {
    await new Promise((res) => setTimeout(res, 30));
    const favoriteFrames = frames.filter((f) =>
      photographerData.favoriteFrameIds.includes(f.id)
    );
    return {
      ...photographerData,
      favoriteFrames,
    };
  },

  async submitContact(formData) {
    await new Promise((res) => setTimeout(res, 600));
    return { success: true, message: 'Your message has been received with warmth.' };
  },
};


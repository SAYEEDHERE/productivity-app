import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

class MoodService {
  constructor() {
    this.collection = 'moods';
  }

  async logMood(userId, moodData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...moodData,
        userId,
        createdAt: serverTimestamp(),
        date: this.formatDate(new Date())
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error logging mood:', error);
      return { success: false, error: error.message };
    }
  }

  async getTodayMood(userId) {
    try {
      const today = this.formatDate(new Date());
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('date', '==', today),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching today mood:', error);
      return null;
    }
  }

  async getMoodHistory(userId, days = 30) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(days)
      );
      const querySnapshot = await getDocs(q);
      const moods = [];
      querySnapshot.forEach((doc) => {
        moods.push({ id: doc.id, ...doc.data() });
      });
      return moods;
    } catch (error) {
      console.error('Error fetching mood history:', error);
      return [];
    }
  }

  async updateMood(moodId, updates) {
    try {
      const moodRef = doc(db, this.collection, moodId);
      await updateDoc(moodRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating mood:', error);
      return { success: false, error: error.message };
    }
  }

  formatDate(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  getMoodEmoji(mood) {
    if (mood >= 9) return '😄';
    if (mood >= 7) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😕';
    return '😔';
  }

  getMoodColor(mood) {
    if (mood >= 8) return '#10b981'; // Green
    if (mood >= 6) return '#f59e0b'; // Yellow
    if (mood >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }
}

export default new MoodService();

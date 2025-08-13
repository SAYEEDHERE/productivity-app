import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class GoalsService {
  constructor() {
    this.collection = 'goals';
  }

  async createGoal(userId, goalData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...goalData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: goalData.status || 'active',
        progress: 0
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { success: false, error: error.message };
    }
  }

  async getGoals(userId) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const goals = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          targetDate: data.targetDate?.toDate()
        });
      });
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  async updateGoal(goalId, updates) {
    try {
      const goalRef = doc(db, this.collection, goalId);
      
      // Convert date to Timestamp if needed
      if (updates.targetDate && updates.targetDate instanceof Date) {
        updates.targetDate = Timestamp.fromDate(updates.targetDate);
      }
      
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteGoal(goalId) {
    try {
      await deleteDoc(doc(db, this.collection, goalId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error: error.message };
    }
  }

  async getGoalsByType(userId, type) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const goals = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          targetDate: data.targetDate?.toDate()
        });
      });
      return goals;
    } catch (error) {
      console.error('Error fetching goals by type:', error);
      return [];
    }
  }

  async getGoalsByStatus(userId, status) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const goals = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          targetDate: data.targetDate?.toDate()
        });
      });
      return goals;
    } catch (error) {
      console.error('Error fetching goals by status:', error);
      return [];
    }
  }

  calculateProgress(goal) {
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal.status === 'completed' ? 100 : 0;
    }
    
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  }

  getGoalStats(goals) {
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      shortTerm: goals.filter(g => g.type === 'short-term').length,
      longTerm: goals.filter(g => g.type === 'long-term').length,
      averageProgress: 0
    };

    if (goals.length > 0) {
      const totalProgress = goals.reduce((acc, goal) => acc + this.calculateProgress(goal), 0);
      stats.averageProgress = Math.round(totalProgress / goals.length);
    }

    return stats;
  }
}

export default new GoalsService();

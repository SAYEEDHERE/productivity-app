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

class TaskService {
  constructor() {
    this.collection = 'tasks';
  }

  async createTask(userId, taskData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...taskData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending',
        pomodoroSessions: [],
        actualTime: 0
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  }

  async getTasks(userId) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate()
        });
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async updateTask(taskId, updates) {
    try {
      const taskRef = doc(db, this.collection, taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTask(taskId) {
    try {
      await deleteDoc(doc(db, this.collection, taskId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  }

  async getTodayTasks(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('dueDate', '>=', Timestamp.fromDate(today)),
        where('dueDate', '<', Timestamp.fromDate(tomorrow))
      );
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate()
        });
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      return [];
    }
  }

  async addPomodoroSession(taskId, sessionData) {
    try {
      const taskRef = doc(db, this.collection, taskId);
      const task = await this.getTask(taskId);
      const updatedSessions = [...(task.pomodoroSessions || []), sessionData];
      const totalTime = updatedSessions.reduce((acc, session) => acc + session.duration, 0);
      
      await updateDoc(taskRef, {
        pomodoroSessions: updatedSessions,
        actualTime: totalTime,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding pomodoro session:', error);
      return { success: false, error: error.message };
    }
  }

  async getTodayPomodoroStats(userId) {
    try {
      const tasks = await this.getTodayTasks(userId);
      const totalSessions = tasks.reduce((acc, task) => 
        acc + (task.pomodoroSessions?.length || 0), 0
      );
      return { completed: totalSessions, total: 8 }; // Assuming 8 sessions goal
    } catch (error) {
      console.error('Error getting pomodoro stats:', error);
      return { completed: 0, total: 8 };
    }
  }
}

export default new TaskService();

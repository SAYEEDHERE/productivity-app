import { GOOGLE_CONFIG } from '../config/google';

class GoogleCalendarService {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
    this.isSignedIn = false;
    this.authInstance = null;
  }

  async init() {
    if (this.isInitialized) return Promise.resolve();

    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => this.initializeGapi(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Google API'));
        document.head.appendChild(script);
      } else {
        this.initializeGapi(resolve, reject);
      }
    });
  }

  initializeGapi(resolve, reject) {
    window.gapi.load('client:auth2', async () => {
      try {
        await window.gapi.client.init({
          clientId: GOOGLE_CONFIG.CLIENT_ID,
          discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
          scope: GOOGLE_CONFIG.SCOPES
        });
        
        this.authInstance = window.gapi.auth2.getAuthInstance();
        this.isSignedIn = this.authInstance.isSignedIn.get();
        this.isInitialized = true;
        resolve();
      } catch (error) {
        console.error('Error initializing Google API:', error);
        reject(error);
      }
    });
  }

  async signIn() {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.authInstance.isSignedIn.get()) {
      try {
        await this.authInstance.signIn();
        this.isSignedIn = true;
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to sign in to Google Calendar' };
      }
    }
    return { success: true };
  }

  async signOut() {
    if (this.authInstance && this.authInstance.isSignedIn.get()) {
      await this.authInstance.signOut();
      this.isSignedIn = false;
    }
  }

  isCalendarSignedIn() {
    return this.isSignedIn;
  }

  async createEvent(task) {
    try {
      const signInResult = await this.signIn();
      if (!signInResult.success) {
        return signInResult;
      }

      const startTime = new Date(task.dueDate);
      const endTime = new Date(startTime.getTime() + (task.estimatedTime || 60) * 60000);

      const event = {
        summary: `📋 ${task.title}`,
        description: `${task.description}\n\n📂 Category: ${task.category}\n🔥 Priority: ${task.priority.toUpperCase()}\n⏰ Estimated time: ${task.estimatedTime} minutes\n\n✨ Created via Productivity App by Sayeed`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 }
          ]
        },
        colorId: this.getPriorityColor(task.priority)
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return { 
        success: true, 
        eventId: response.result.id,
        eventLink: response.result.htmlLink 
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return { success: false, error: 'Failed to create calendar event' };
    }
  }

  async getUpcomingEvents(maxResults = 10) {
    try {
      const signInResult = await this.signIn();
      if (!signInResult.success) {
        return { success: false, error: 'Not signed in to Google Calendar' };
      }

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      });

      return { 
        success: true, 
        events: response.result.items || [] 
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch calendar events' };
    }
  }

  getPriorityColor(priority) {
    const colorMap = {
      'urgent': '11', // Red
      'high': '6',    // Orange  
      'medium': '5',  // Yellow
      'low': '2'      // Green
    };
    return colorMap[priority] || '1'; // Default blue
  }
}

export default new GoogleCalendarService();

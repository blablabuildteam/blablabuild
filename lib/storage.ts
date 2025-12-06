// In-memory storage (replaces Supabase)
// Note: Data is lost on server restart - for production, use a real database

interface Session {
  id: string;
  locale: string;
  email?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  consent: boolean;
  created_at: string;
  completed_at?: string;
}

interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Event {
  id: string;
  session_id: string;
  type: string;
  payload: any;
  created_at: string;
}

interface Slot {
  session_id: string;
  key: string;
  value: string;
  confidence: number;
}

// In-memory stores
const sessions = new Map<string, Session>();
const messages: Message[] = [];
const events: Event[] = [];
const slots: Slot[] = [];

let idCounter = 0;
const generateId = () => `${++idCounter}_${Date.now()}`;

// Session operations
export const sessionStore = {
  insert: async (data: Omit<Session, 'created_at'>) => {
    const session: Session = {
      ...data,
      created_at: new Date().toISOString(),
    };
    sessions.set(data.id, session);
    return { data: session, error: null };
  },
  
  update: async (id: string, data: Partial<Session>) => {
    const session = sessions.get(id);
    if (session) {
      Object.assign(session, data);
      return { data: session, error: null };
    }
    return { data: null, error: 'Session not found' };
  },
  
  get: async (id: string) => {
    return { data: sessions.get(id) || null, error: null };
  },
  
  count: async () => {
    return { count: sessions.size, error: null };
  },
};

// Message operations
export const messageStore = {
  insert: async (data: Omit<Message, 'id' | 'created_at'>) => {
    const message: Message = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    messages.push(message);
    return { data: message, error: null };
  },
  
  getBySession: async (sessionId: string) => {
    const sessionMessages = messages
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { data: sessionMessages, error: null };
  },
  
  count: async () => {
    return { count: messages.length, error: null };
  },
};

// Event operations
export const eventStore = {
  insert: async (data: Omit<Event, 'id' | 'created_at'>) => {
    const event: Event = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    events.push(event);
    return { data: event, error: null };
  },
  
  getBySession: async (sessionId: string) => {
    const sessionEvents = events
      .filter(e => e.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { data: sessionEvents, error: null };
  },
};

// Slot operations
export const slotStore = {
  upsert: async (data: Slot) => {
    const existingIndex = slots.findIndex(
      s => s.session_id === data.session_id && s.key === data.key
    );
    if (existingIndex >= 0) {
      slots[existingIndex] = data;
    } else {
      slots.push(data);
    }
    return { data, error: null };
  },
  
  getBySession: async (sessionId: string) => {
    return { data: slots.filter(s => s.session_id === sessionId), error: null };
  },
};


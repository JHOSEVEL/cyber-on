
import { User, Lab, AuthResponse, LeaderboardEntry, Difficulty } from '../types';
import { INITIAL_LABS, MOCK_DELAY_MS, AVATAR_BASE, THUMBNAIL_BASE, RANK_SYSTEM } from '../constants';

// LocalStorage Keys
const KEYS = {
  USERS: 'cyberlabs_users',
  LABS: 'cyberlabs_labs',
  CURRENT_USER: 'cyberlabs_current_user',
  TOKEN: 'cyberlabs_token'
};

// --- Helpers to simulate DB ---
const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(KEYS.USERS);
  return stored ? JSON.parse(stored) : [];
};

const getStoredLabs = (): Lab[] => {
  const stored = localStorage.getItem(KEYS.LABS);
  if (stored) return JSON.parse(stored);
  // Initialize with defaults if empty
  localStorage.setItem(KEYS.LABS, JSON.stringify(INITIAL_LABS));
  return INITIAL_LABS;
};

const saveUsers = (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users));

// --- Rank Logic ---
const calculateUserRankTitle = (score: number): string => {
  // Find the highest tier where score >= minScore
  let rank = RANK_SYSTEM[0].title;
  for (const tier of RANK_SYSTEM) {
    if (score >= tier.minScore) {
      rank = tier.title;
    }
  }
  return rank;
};

const getGlobalRank = (userId: number, users: User[]): number => {
  // Sort by score desc
  const sorted = [...users].sort((a, b) => b.score - a.score);
  const index = sorted.findIndex(u => u.id === userId);
  return index === -1 ? 999 : index + 1;
};

// Utility for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Service ---

export const api = {
  login: async (email: string): Promise<AuthResponse> => {
    await delay(MOCK_DELAY_MS);
    const users = getStoredUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      // Auto-register for MVP simplicity if not found
      user = {
        id: Date.now(),
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        score: 0,
        rankTitle: RANK_SYSTEM[0].title,
        completedLabs: [],
        avatarUrl: `${AVATAR_BASE}${Math.floor(Math.random() * 1000)}`
      };
      users.push(user);
      saveUsers(users);
    } else {
      // Ensure existing users have rankTitle
      if (!user.rankTitle) {
        user.rankTitle = calculateUserRankTitle(user.score);
        saveUsers(users);
      }
    }

    // Calculate dynamic rank
    user.rank = getGlobalRank(user.id, users);

    const token = `fake-jwt-token-${user.id}`;
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    
    return { token, user };
  },

  logout: async () => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: async (): Promise<User | null> => {
    // In a real app, we'd validate the token with the backend
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    if (!stored) return null;

    let user: User = JSON.parse(stored);
    
    // Sync with 'DB' to get latest score/rank
    const dbUsers = getStoredUsers();
    const dbUser = dbUsers.find(u => u.id === user.id);
    
    if (dbUser) {
      user = { ...dbUser, rank: getGlobalRank(dbUser.id, dbUsers) };
      // Update session cache
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
    
    return user;
  },

  getLabs: async (): Promise<Lab[]> => {
    await delay(MOCK_DELAY_MS / 2);
    return getStoredLabs();
  },

  getLabById: async (id: number): Promise<Lab | undefined> => {
    await delay(MOCK_DELAY_MS / 2);
    return getStoredLabs().find(l => l.id === id);
  },

  submitFlag: async (labId: number, flag: string, userId: number): Promise<{ success: boolean; pointsAdded: number; message: string }> => {
    await delay(MOCK_DELAY_MS);
    const labs = getStoredLabs();
    const users = getStoredUsers();
    
    const lab = labs.find(l => l.id === labId);
    const userIndex = users.findIndex(u => u.id === userId);

    if (!lab || userIndex === -1) {
      return { success: false, pointsAdded: 0, message: 'System error' };
    }

    if (users[userIndex].completedLabs.includes(labId)) {
      return { success: true, pointsAdded: 0, message: 'Already solved!' };
    }

    // Grant points and complete lab
    users[userIndex].completedLabs.push(labId);
    users[userIndex].score += lab.points;
    users[userIndex].rankTitle = calculateUserRankTitle(users[userIndex].score);
    
    saveUsers(users);
    
    // Update current session user with new score and rank
    const updatedUser = { 
        ...users[userIndex], 
        rank: getGlobalRank(users[userIndex].id, users) 
    };
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    return { success: true, pointsAdded: lab.points, message: `Correct! +${lab.points} points` };
  },

  createLab: async (labData: Partial<Lab>): Promise<Lab> => {
    await delay(MOCK_DELAY_MS);
    const labs = getStoredLabs();
    const newLab: Lab = {
      ...labData as Lab,
      id: Date.now(),
      slug: labData.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
      thumbnail: `${THUMBNAIL_BASE}${labs.length + 5}`,
      steps: [] // Admin panel doesn't support step creation yet in MVP
    };
    labs.push(newLab);
    localStorage.setItem(KEYS.LABS, JSON.stringify(labs));
    return newLab;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await delay(MOCK_DELAY_MS);
    const users = getStoredUsers();
    
    return users
      .sort((a, b) => b.score - a.score)
      .map((u, index) => ({
        userId: u.id,
        name: u.name,
        score: u.score,
        rank: index + 1,
        rankTitle: u.rankTitle || calculateUserRankTitle(u.score),
        avatarUrl: u.avatarUrl || ''
      }));
  }
};

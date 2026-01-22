
import { UserProfile, Tournament, ChatMessage, ChatType } from '../types';

const USERS_KEY = 'zg_users';
const TOURNAMENTS_KEY = 'zg_tournaments';
const CHATS_KEY = 'zg_chats';

const initialTournaments: Tournament[] = [
  {
    id: 't1',
    nombre: 'CYBER CUP: VALORANT',
    desc: 'Torneo 5v5 para rangos Diamante+',
    capacidad: 16,
    inscritos_count: 12,
    jugadores: [],
    bracket_url: 'https://challonge.com/valorant'
  },
  {
    id: 't2',
    nombre: 'LEAGUE OF LEGENDS - MID SEASON',
    desc: 'Encuentra tu equipo y domina la Grieta.',
    capacidad: 8,
    inscritos_count: 4,
    jugadores: [],
    bracket_url: 'https://challonge.com/lol'
  }
];

export const dbService = {
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getUserById: (uid: string): UserProfile | undefined => {
    return dbService.getUsers().find(u => u.uid === uid);
  },

  saveUser: (user: UserProfile) => {
    const users = dbService.getUsers();
    const index = users.findIndex(u => u.uid === user.uid);
    if (index > -1) users[index] = user;
    else users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('storage')); // Forzar actualización local
  },

  getTournaments: (): Tournament[] => {
    const data = localStorage.getItem(TOURNAMENTS_KEY);
    if (!data) {
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(initialTournaments));
      return initialTournaments;
    }
    return JSON.parse(data);
  },

  joinTournament: (tournamentId: string, userUid: string): boolean => {
    const tournaments = dbService.getTournaments();
    const tIdx = tournaments.findIndex(t => t.id === tournamentId);
    if (tIdx === -1) return false;

    const tournament = tournaments[tIdx];
    if (tournament.jugadores.includes(userUid)) return false;
    if (tournament.inscritos_count >= tournament.capacidad) return false;

    tournament.jugadores.push(userUid);
    tournament.inscritos_count += 1;
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    window.dispatchEvent(new Event('storage'));
    return true;
  },

  getMessages: (): ChatMessage[] => {
    const data = localStorage.getItem(CHATS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const messages = dbService.getMessages();
    const newMessage: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    messages.push(newMessage);
    localStorage.setItem(CHATS_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event('storage'));
    return newMessage;
  },

  // Simulación de onSnapshot
  subscribe: (callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }
};

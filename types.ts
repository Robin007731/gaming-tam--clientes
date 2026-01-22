
export interface UserProfile {
  uid: string;
  nick: string;
  email: string;
  puntos: number;
  avatar?: string;
  status?: 'active' | 'banned';
  role?: 'user' | 'admin';
}

export interface Tournament {
  id: string;
  nombre: string;
  desc: string;
  capacidad: number;
  inscritos_count: number;
  jugadores: string[]; 
  bracket_url: string;
}

export enum ChatType {
  GLOBAL = 'global',
  PRIVADO = 'privado'
}

export interface ChatMessage {
  id: string;
  texto: string;
  senderId: string;
  senderNick: string;
  tipo: ChatType;
  chatId?: string; 
  timestamp: number;
  role?: 'user' | 'admin' | 'system';
}

export type Section = 'torneos' | 'social' | 'perfil';

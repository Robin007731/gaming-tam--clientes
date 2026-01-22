
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Cpu, 
  User, 
  LogOut, 
  Send, 
  Gamepad2, 
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, Section, Tournament, ChatMessage, ChatType } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('torneos');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nick, setNick] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [privateChatWith, setPrivateChatWith] = useState<UserProfile | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // EFECTO: Sincronización en tiempo Real (onSnapshot Simulation)
  useEffect(() => {
    const syncData = () => {
      // 1. Sincronizar Torneos
      setTournaments(dbService.getTournaments());
      // 2. Sincronizar Mensajes
      setMessages(dbService.getMessages());
      
      // 3. Sincronizar Perfil y verificar Status (Banned)
      if (user) {
        const freshUserData = dbService.getUserById(user.uid);
        if (freshUserData) {
          if (freshUserData.status === 'banned') {
            alert("⚠️ ACCESO REVOCADO: Tu cuenta ha sido suspendida por el Administrador.");
            handleLogout();
            return;
          }
          // Actualiza puntos/nick si el admin los cambió
          if (freshUserData.puntos !== user.puntos || freshUserData.nick !== user.nick) {
            setUser(freshUserData);
            localStorage.setItem('zg_current_user', JSON.stringify(freshUserData));
          }
        }
      }
    };

    // Carga inicial
    const storedUser = localStorage.getItem('zg_current_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    syncData();

    // Suscribirse a cambios (Simulando onSnapshot)
    const unsubscribe = dbService.subscribe(syncData);
    return () => unsubscribe();
  }, [user?.uid, user?.puntos, user?.nick]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateChatWith]);

  const nav = (section: Section) => {
    setActiveSection(section);
    if (section !== 'social') setPrivateChatWith(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUsers = dbService.getUsers();
    const found = existingUsers.find(u => u.email === email);

    if (isRegistering) {
      if (found) return alert("El usuario ya existe.");
      const newUser: UserProfile = {
        uid: Math.random().toString(36).substr(2, 9),
        nick,
        email,
        avatar: avatar || undefined,
        puntos: 0,
        status: 'active',
        role: 'user'
      };
      dbService.saveUser(newUser);
      setUser(newUser);
      localStorage.setItem('zg_current_user', JSON.stringify(newUser));
    } else {
      if (found) {
        if (found.status === 'banned') return alert("CUENTA SUSPENDIDA.");
        setUser(found);
        localStorage.setItem('zg_current_user', JSON.stringify(found));
      } else {
        alert("Credenciales incorrectas.");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zg_current_user');
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    dbService.addMessage({
      texto: newMessage,
      senderId: user.uid,
      senderNick: user.nick,
      tipo: privateChatWith ? ChatType.PRIVADO : ChatType.GLOBAL,
      chatId: privateChatWith ? [user.uid, privateChatWith.uid].sort().join('_') : undefined,
      role: user.role
    });
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030508] p-4 font-rajdhani">
        <div className="max-w-md w-full cyber-card p-8 border border-[#00f2ff]/30">
          <h1 className="text-3xl font-orbitron font-black text-center mb-2 text-[#00f2ff] neon-text-cyan">ZONA GAMER</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            {isRegistering && (
              <input type="text" required className="w-full bg-black border-b border-[#00f2ff]/30 p-2 text-white font-orbitron text-xs" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="GAMERTAG" />
            )}
            <input type="email" required className="w-full bg-black border-b border-[#00f2ff]/30 p-2 text-white font-orbitron text-xs" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL" />
            <input type="password" required className="w-full bg-black border-b border-[#00f2ff]/30 p-2 text-white font-orbitron text-xs" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" />
            <button type="submit" className="w-full bg-[#00f2ff] text-black font-orbitron font-bold py-3 hover:bg-white transition-all shadow-[0_0_10px_#00f2ff]">
              {isRegistering ? 'REGISTRAR' : 'ENTRAR'}
            </button>
            <p className="text-center text-[10px] text-gray-500 font-orbitron cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? '¿YA TIENES CUENTA? LOGIN' : '¿NUEVO RECLUTA? REGISTRARSE'}
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-rajdhani">
      <header className="sticky top-0 z-50 bg-[#030508]/90 backdrop-blur-md border-b border-[#00f2ff]/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00f2ff] flex items-center justify-center shadow-[0_0_10px_#00f2ff]"><Cpu size={18} className="text-black" /></div>
          <span className="font-orbitron font-black text-xl text-[#00f2ff]">ZG</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-white font-orbitron font-bold uppercase tracking-widest" id="my-nick">{user.nick}</p>
            <p className="text-[12px] text-[#39FF14] font-orbitron font-bold" id="my-xp">{user.puntos} XP</p>
          </div>
          <button onClick={handleLogout} className="text-[#ff3131] hover:scale-110"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {activeSection === 'torneos' && (
          <div className="space-y-6">
            <h2 className="text-xl font-orbitron font-bold text-white neon-text-green flex items-center gap-2">
              <Trophy size={20}/> ARENA DE TORNEOS (PUSH LIVE)
            </h2>
            <div id="tournament-list" className="space-y-4">
              {tournaments.map(t => (
                <div key={t.id} className="cyber-card p-4 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[#00f2ff] font-orbitron font-bold">{t.nombre}</h3>
                    <span className="text-[10px] font-orbitron text-gray-400">{t.inscritos_count}/{t.capacidad} JUGADORES</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{t.desc}</p>
                  <button onClick={() => dbService.joinTournament(t.id, user.uid)} className="w-full py-2 bg-gray-900 border border-[#00f2ff] text-[#00f2ff] font-orbitron text-[10px] hover:bg-[#00f2ff] hover:text-black transition-all">UNIRSE AL COMBATE</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'social' && (
          <div className="flex flex-col h-[70vh]">
            <h2 className="text-xl font-orbitron font-bold text-white neon-text-cyan mb-4 flex items-center gap-2">
              <MessageSquare size={20}/> CANAL DE DATOS
            </h2>
            <div className="flex-1 overflow-y-auto bg-black/40 border border-white/5 p-4 space-y-3 custom-scrollbar">
              {messages.filter(m => !privateChatWith || (m.tipo === ChatType.PRIVADO && m.chatId === [user.uid, privateChatWith.uid].sort().join('_'))).map(m => {
                const isSystem = m.senderId === "system" || m.role === "admin";
                const isOwn = m.senderId === user.uid;
                
                return (
                  <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 max-w-[85%] border-l-4 ${isSystem ? 'bg-red-950/30 border-[#ff3131] text-[#ff3131]' : isOwn ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white' : 'bg-gray-800/50 border-gray-600 text-gray-300'}`}>
                      {isSystem && <div className="flex items-center gap-1 text-[8px] font-black uppercase mb-1 font-orbitron"><ShieldAlert size={10}/> MENSAJE DEL SISTEMA</div>}
                      <p className="text-[9px] font-bold opacity-50 font-orbitron mb-1">{isSystem ? 'ADMIN_ROOT' : m.senderNick}</p>
                      <p className="text-sm font-rajdhani font-medium">{isSystem ? `📢 ${m.texto}` : m.texto}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="TRANSMITIR..." className="flex-1 bg-black border border-[#00f2ff]/30 p-3 text-white font-orbitron text-[10px]" />
              <button type="submit" className="bg-[#00f2ff] p-3 text-black"><Send size={20} /></button>
            </form>
          </div>
        )}

        {activeSection === 'perfil' && (
          <div className="space-y-6 text-center cyber-card p-10 border border-white/5 bg-black/50">
            <div className="w-24 h-24 bg-gray-900 border-2 border-[#00f2ff] mx-auto mb-4 neon-border flex items-center justify-center">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <User size={48} className="text-[#00f2ff]"/>}
            </div>
            <h3 className="text-3xl font-orbitron font-black text-white">{user.nick}</h3>
            <p className="text-[#00f2ff] font-orbitron text-[10px] tracking-[0.4em] font-bold">RANGO: PRO-GAMER</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-black/80 p-4 border border-white/5"><p className="text-[8px] text-gray-500 font-orbitron uppercase">XP ACTUAL</p><p className="text-2xl font-orbitron text-[#39FF14]">{user.puntos}</p></div>
              <div className="bg-black/80 p-4 border border-white/5"><p className="text-[8px] text-gray-500 font-orbitron uppercase">STATUS</p><p className="text-2xl font-orbitron text-[#00f2ff] uppercase text-xs">{user.status}</p></div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#030508]/95 border-t border-[#00f2ff]/30 h-16 flex items-center justify-around z-50">
        <button onClick={() => nav('torneos')} className={`flex flex-col items-center transition-all ${activeSection === 'torneos' ? 'text-[#00f2ff] neon-text-cyan' : 'text-gray-600'}`}><Trophy size={20}/><span className="text-[8px] font-orbitron uppercase">Torneos</span></button>
        <button onClick={() => nav('social')} className={`flex flex-col items-center transition-all ${activeSection === 'social' ? 'text-[#00f2ff] neon-text-cyan' : 'text-gray-600'}`}><MessageSquare size={20}/><span className="text-[8px] font-orbitron uppercase">Social</span></button>
        <button onClick={() => nav('perfil')} className={`flex flex-col items-center transition-all ${activeSection === 'perfil' ? 'text-[#00f2ff] neon-text-cyan' : 'text-gray-600'}`}><User size={20}/><span className="text-[8px] font-orbitron uppercase">Perfil</span></button>
      </nav>
    </div>
  );
};

export default App;

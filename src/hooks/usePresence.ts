import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PresenceState = {
  id: string;
  name: string;
  color: string;
};

const NAMES = ["Wandering Aqua", "Anonymous Kaido", "Lost Frieren", "Trading Goblin", "Gojo Enjoyer", "Value Sniper", "Pity Roller", "Gacha Victim", "Idle Farmer", "Shadow Monarch", "Domain Expander"];
const COLORS = ["#ed4245", "#5865F2", "#23a559", "#FAA61A", "#a855f7", "#ec4899", "#14b8a6", "#f43f5e"];

const getIdentity = (): PresenceState => {
  if (typeof window === 'undefined') return { id: '0', name: 'Ghost', color: '#fff' };
  let stored = sessionStorage.getItem('astd_identity');
  if (!stored) {
    const id = Math.random().toString(36).substring(2, 9);
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    stored = JSON.stringify({ id, name, color });
    sessionStorage.setItem('astd_identity', stored);
  }
  return JSON.parse(stored);
};

export function usePresence() {
  const [users, setUsers] = useState<PresenceState[]>([]);
  const identity = getIdentity();

  useEffect(() => {
    // Connect to a single global room
    const room = supabase.channel('astd-global', {
      config: { presence: { key: identity.id } }
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        // Route through 'unknown' to satisfy TypeScript's strict type checking
        const activeUsers = Object.values(state).map((presences) => presences[0] as unknown as PresenceState);
        setUsers(activeUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Broadcast this user to everyone else
          await room.track({ id: identity.id, name: identity.name, color: identity.color });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [identity.id, identity.name, identity.color]);

  return users;
}
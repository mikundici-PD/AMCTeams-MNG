import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAllNotifications } from '../services/notifications';

export interface Atleta {
  id: string;
  teamId: string;
  nome: string;
  cognome: string;
  certificatoMedico: string; // YYYY-MM-DD
  nascita: string;
  maglia: string;
}

export interface Gara {
  id: string;
  teamId: string;
  avversario: string;
  data: string; // ISO String
  luogo: string;
}

export interface Team {
  id: string;
  nome: string;
}

interface AppState {
  teams: Team[];
  atlete: Atleta[];
  gare: Gara[];
  addTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  addAtleta: (atleta: Atleta) => void;
  addGara: (gara: Gara) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      teams: [],
      atlete: [],
      gare: [],
      addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
      deleteTeam: (id) => {
        set((state) => ({ 
          teams: state.teams.filter(t => t.id !== id),
          atlete: state.atlete.filter(a => a.teamId !== id),
          gare: state.gare.filter(g => g.teamId !== id)
        }));
        scheduleAllNotifications(get().atlete);
      },
      addAtleta: (atleta) => {
        set((state) => ({ atlete: [...state.atlete, atleta] }));
        // Schedula le notifiche dopo l'inserimento
        scheduleAllNotifications(get().atlete);
      },
      addGara: (gara) => set((state) => ({ gare: [...state.gare, gara] })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

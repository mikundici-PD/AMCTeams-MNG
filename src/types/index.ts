export type Status = 'OK' | 'WARN' | 'ALT' | 'MISS';

export interface Atleta {
  id: string;
  teamId: string;
  nome: string;
  cognome: string;
  certificatoMedico: string; // ISO Date
  autocertificazione: string; // ISO Date
  dataNascita: string;
  maglia: string;
  // ... altri campi
}

export interface Gara {
  id: string;
  teamId: string;
  avversario: string;
  luogo: string;
  dataOra: string; // ISO String
}

export interface Team {
  id: string;
  nome: string;
}

import { differenceInDays, parseISO } from 'date-fns';

export type Status = 'OK' | 'WARN' | 'ALT' | 'MISS';

export const getAtletaStatus = (certificatoData: string | null): Status => {
  if (!certificatoData) return 'MISS';
  
  const oggi = new Date();
  const scadenza = parseISO(certificatoData);
  const giorniRimanenti = differenceInDays(scadenza, oggi);

  if (giorniRimanenti < 0) return 'ALT';      // Scaduto
  if (giorniRimanenti <= 30) return 'WARN';   // Scade a breve
  return 'OK';                                // Tutto a posto
};

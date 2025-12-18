import * as Notifications from 'expo-notifications';
import { differenceInDays, parseISO, subDays } from 'date-fns';
import { Atleta } from '../store/useStore';

// Configurazione comportamento notifiche
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleAllNotifications = async (atlete: Atleta[]) => {
  // 1. Cancella tutte le notifiche programmate precedentemente per evitare duplicati
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const atleta of atlete) {
    if (!atleta.certificatoMedico) continue;

    const scadenza = parseISO(atleta.certificatoMedico);
    const oggi = new Date();

    // Notifica 1: Scadenza imminente (30 giorni prima)
    const dataWarn = subDays(scadenza, 30);
    if (dataWarn > oggi) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Scadenza Certificato",
          body: `Il certificato di ${atleta.nome} ${atleta.cognome} scadrà tra 30 giorni.`,
          data: { atletaId: atleta.id },
        },
        trigger: dataWarn,
      });
    }

    // Notifica 2: Giorno della scadenza
    if (scadenza > oggi) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 Certificato Scaduto!",
          body: `Il certificato di ${atleta.nome} ${atleta.cognome} è scaduto oggi. L'atleta non può giocare.`,
          data: { atletaId: atleta.id },
        },
        trigger: scadenza,
      });
    }
  }
};

import * as Notifications from 'expo-notifications';
import { differenceInDays, parseISO } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleAllNotifications = async (atlete: Atleta[], gare: Gara[]) => {
  // 1. Pulisci tutte le notifiche esistenti per evitare duplicati
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Cicla Atlete per scadenze documenti
  atlete.forEach(atleta => {
    const scadenza = parseISO(atleta.certificatoMedico);
    const giorniAllaScadenza = differenceInDays(scadenza, new Date());

    if (giorniAllaScadenza > 0) {
      // Notifica 30 giorni prima (WARN)
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Scadenza Certificato",
          body: `${atleta.nome} ${atleta.cognome} ha il certificato in scadenza tra 30 giorni!`,
        },
        trigger: { 
            seconds: (giorniAllaScadenza - 30) * 86400, // Calcolo semplificato
        }, 
      });
    }
  });

  // 3. Compleanni (Esempio annuale)
  // ... logica simile
};

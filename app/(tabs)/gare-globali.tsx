import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useStore, Gara } from '../../src/store/useStore';
import { Share2, Calendar as CalendarIcon, MapPin } from 'lucide-react-native';
import { format, parseISO, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';

export default function GlobalGareScreen() {
  const { gare, teams } = useStore();

  // Ordiniamo le gare: le più recenti (o future) in alto
  const sortedGare = [...gare].sort((a, b) => 
    parseISO(a.data).getTime() - parseISO(b.data).getTime()
  );

  // Funzione per trovare il nome della squadra dall'ID
  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.nome || 'Squadra Sconosciuta';
  };

  // Funzione di condivisione calendario
  const shareCalendar = async () => {
    if (sortedGare.length === 0) return;

    const calendarText = sortedGare
      .map(g => {
        const dataFormattata = format(parseISO(g.data), "eeee dd MMMM 'ore' HH:mm", { locale: it });
        return `📌 ${getTeamName(g.teamId)} vs ${g.avversario}\n📅 ${dataFormattata}\n📍 ${g.luogo}\n`;
      })
      .join('\n------------------\n');

    try {
      await Share.share({
        title: 'Calendario Gare',
        message: `CALENDARIO GARE:\n\n${calendarText}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tutte le Gare</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={shareCalendar}>
          <Share2 size={20} color="white" />
          <Text style={styles.shareBtnText}>Condividi</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedGare}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna gara programmata.</Text>}
        renderItem={({ item }) => (
          <View style={styles.garaCard}>
            <View style={styles.dateBadge}>
              <CalendarIcon size={14} color="#007AFF" />
              <Text style={styles.dateText}>
                {format(parseISO(item.data), "dd MMM yyyy - HH:mm", { locale: it })}
              </Text>
            </View>
            <Text style={styles.teamContext}>{getTeamName(item.teamId)}</Text>
            <Text style={styles.matchText}>vs {item.avversario}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#666" />
              <Text style={styles.locationText}>{item.luogo}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'white' 
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  shareBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    gap: 6 
  },
  shareBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  garaCard: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dateText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13, textTransform: 'capitalize' },
  teamContext: { fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 },
  matchText: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: '#666', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 50, color: '#8E8E93' }
});

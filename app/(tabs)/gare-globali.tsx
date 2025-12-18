import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { Share2, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export default function GlobalGareScreen() {
  const { gare, teams } = useStore();

  // Ordiniamo tutte le gare di tutte le squadre per data
  const sortedGare = [...gare].sort((a, b) => 
    parseISO(a.data).getTime() - parseISO(b.data).getTime()
  );

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.nome || 'Squadra';
  };

  // --- FUNZIONE CONDIVIDI ---
  const shareCalendar = async () => {
    if (sortedGare.length === 0) {
      Alert.alert("Info", "Non ci sono gare da condividere.");
      return;
    }

    const testoCalendario = sortedGare
      .map(g => {
        const dataFormattata = format(parseISO(g.data), "eeee dd MMMM 'ore' HH:mm", { locale: it });
        return `🏟️ ${getTeamName(g.teamId).toUpperCase()}\n🆚 vs ${g.avversario}\n📅 ${dataFormattata}\n📍 ${g.luogo}\n`;
      })
      .join('\n────────────────\n');

    try {
      await Share.share({
        title: 'Calendario Gare',
        message: `📢 CALENDARIO GARE AGGIORNATO:\n\n${testoCalendario}`,
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
          <Share2 size={18} color="white" />
          <Text style={styles.shareBtnText}>Condividi</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedGare}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna gara in archivio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.garaCard}>
            <View style={styles.infoRow}>
              <Text style={styles.teamTag}>{getTeamName(item.teamId)}</Text>
              <View style={styles.dateTime}>
                <Clock size={12} color="#007AFF" />
                <Text style={styles.dateText}>
                  {format(parseISO(item.data), "dd MMM HH:mm", { locale: it })}
                </Text>
              </View>
            </View>
            
            <Text style={styles.matchText}>vs {item.avversario}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={14} color="#8E8E93" />
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
    paddingTop: 60, // Spazio per la status bar
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  shareBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 14, 
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  teamTag: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#007AFF', 
    backgroundColor: '#EBF5FF', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4,
    textTransform: 'uppercase'
  },
  dateTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#007AFF' },
  matchText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#8E8E93', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 50, color: '#8E8E93' }
});

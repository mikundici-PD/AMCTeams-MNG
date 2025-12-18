import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { Plus, ChevronRight, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TeamsScreen() {
  const { teams, addTeam } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const router = useRouter();

  const handleCreate = () => {
    if (teamName.trim()) {
      addTeam(teamName);
      setTeamName('');
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna squadra creata.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/team/${item.id}`)}
          >
            <View style={styles.cardContent}>
              <Shield color="#007AFF" size={24} />
              <Text style={styles.teamName}>{item.nome}</Text>
            </View>
            <ChevronRight color="#CCC" />
          </TouchableOpacity>
        )}
      />

      {/* Bottone Fluttuante */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="white" size={30} />
      </TouchableOpacity>

      {/* Popup Creazione */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuova Squadra</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome della squadra..."
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.btn, styles.btnCancel]}>
                <Text>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={[styles.btn, styles.btnConfirm]}>
                <Text style={{color: 'white'}}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2, // Ombra Android
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamName: { fontSize: 18, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#007AFF', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderBottomWidth: 1, borderColor: '#DDD', paddingVertical: 8, marginBottom: 24, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnCancel: { backgroundColor: '#EEE' },
  btnConfirm: { backgroundColor: '#007AFF' }
});

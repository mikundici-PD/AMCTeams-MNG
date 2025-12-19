import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, Shield } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';
// import * as Notifications from 'expo-notifications'; // ← SOLO SE SERVE

export default function TeamsScreen() {
  const { teams, addTeam } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const router = useRouter();

  // ✅ EVENTUALE LOGICA SENSIBILE → QUI È SICURA
  /*
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);
  */

  const handleCreate = () => {
    if (!teamName.trim()) return;

    addTeam(teamName.trim());
    setTeamName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Nessuna squadra creata.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/team/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Shield color="#007AFF" size={24} />
              <Text style={styles.teamName}>{item.nome}</Text>
            </View>
            <ChevronRight color="#CCC" />
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus color="white" size={30} />
      </TouchableOpacity>

      {/* Modal creazione squadra */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
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
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.btn, styles.btnCancel]}
              >
                <Text>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreate}
                style={[styles.btn, styles.btnConfirm]}
              >
                <Text style={{ color: 'white' }}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2, // Android shadow
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: '#EEE',
  },
  btnConfirm: {
    backgroundColor: '#007AFF',
  },
});

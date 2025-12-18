import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, 
  TextInput, ScrollView, Alert, Share, Platform, Image 
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useStore, Atleta, Gara } from '../../src/store/useStore';
import { 
  Users, Trophy, Plus, ChevronLeft, MapPin, 
  Calendar as CalIcon, Clock, Phone, Contact2, X, Share2, Database, FileText, Upload
} from 'lucide-react-native';
import { getAtletaStatus } from '../../src/utils/statusLogic';
import { exportToCSV, importFromCSV } from '../../src/services/csvService';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, addWeeks, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { teams, atlete, gare, addAtleta, addGara } = useStore();
  
  // STATI UI
  const [activeTab, setActiveTab] = useState<'ATLETE' | 'GARE'>('ATLETE');
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // STATI FORM
  const [newAtleta, setNewAtleta] = useState<Partial<Atleta>>({ 
    nome: '', cognome: '', maglia: '', certificatoMedico: '', telefono: '', docImage: '', certificatoFileUri: '' 
  });
  const [newGara, setNewGara] = useState<Partial<Gara>>({ avversario: '', data: '', ora: '', luogo: '' });

  const team = teams.find((t) => t.id === id);
  const teamAtlete = atlete.filter((a) => a.teamId === id);
  const teamGare = [...gare]
    .filter((g) => g.teamId === id)
    .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime());

  if (!team) return <View style={styles.container}><Text>Squadra non trovata.</Text></View>;

  // --- LOGICA MEDIA (CARICAMENTO E APERTURA) ---
  const pickFile = async (type: 'doc' | 'cert') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'cert' ? ['application/pdf', 'image/*'] : 'image/*',
        copyToCacheDirectory: true
      });
      if (!result.canceled) {
        if (type === 'doc') setNewAtleta({...newAtleta, docImage: result.assets[0].uri});
        else setNewAtleta({...newAtleta, certificatoFileUri: result.assets[0].uri});
      }
    } catch (err) {
      Alert.alert("Errore", "Impossibile caricare il file");
    }
  };

  const openFile = async (uri: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      return Alert.alert("Errore", "Il tuo dispositivo non supporta l'apertura di file esterni");
    }
    await Sharing.shareAsync(uri);
  };

  // --- LOGICA CONDIVISIONE GARE ---
  const handleShareGare = () => {
    const options = ['Annulla', 'Prossima gara', 'Settimana in corso', 'Settimana + successiva', 'Tutto il calendario'];
    Alert.alert("Condividi Gare", "Scegli l'intervallo da inviare:", 
      options.slice(1).map((opt, idx) => ({ 
        text: opt, onPress: () => executeShare(idx + 1) 
      })).concat([{ text: "Annulla", style: "cancel" }])
    );
  };

  const executeShare = async (index: number) => {
    const ora = new Date();
    let daInviare: Gara[] = [];
    if (index === 1) { 
      const p = teamGare.find(g => isAfter(parseISO(g.data), ora)); 
      if (p) daInviare = [p]; 
    } else if (index === 2) {
      daInviare = teamGare.filter(g => isWithinInterval(parseISO(g.data), { start: startOfWeek(ora, { weekStartsOn: 1 }), end: endOfWeek(ora, { weekStartsOn: 1 }) }));
    } else if (index === 3) {
      daInviare = teamGare.filter(g => isWithinInterval(parseISO(g.data), { start: startOfWeek(ora, { weekStartsOn: 1 }), end: endOfWeek(addWeeks(ora, 1), { weekStartsOn: 1 }) }));
    } else {
      daInviare = teamGare;
    }

    if (daInviare.length === 0) return Alert.alert("Info", "Nessuna gara trovata per questo filtro.");
    
    const msg = daInviare.map(g => (
      `📅 ${format(parseISO(g.data), "eeee dd MMMM 'ore' HH:mm", { locale: it })}\n🆚 vs ${g.avversario}\n📍 ${g.luogo}`
    )).join('\n\n------------------\n\n');

    await Share.share({ message: `📌 CALENDARIO ${team.nome.toUpperCase()}\n\n${msg}` });
  };

  // --- LOGICA SALVATAGGIO ---
  const handleSave = () => {
    if (activeTab === 'ATLETE') {
      if (!newAtleta.nome || !newAtleta.cognome) return Alert.alert("Errore", "Nome e Cognome obbligatori");
      addAtleta({
        id: Date.now().toString(), teamId: id as string,
        nome: newAtleta.nome!, cognome: newAtleta.cognome!,
        maglia: newAtleta.maglia || '-', certificatoMedico: newAtleta.certificatoMedico || '',
        nascita: newAtleta.nascita || '', telefono: newAtleta.telefono,
        docImage: newAtleta.docImage, certificatoFileUri: newAtleta.certificatoFileUri
      });
      setNewAtleta({ nome: '', cognome: '', maglia: '', certificatoMedico: '', telefono: '', docImage: '', certificatoFileUri: '' });
    } else {
      if (!newGara.avversario || !newGara.data) return Alert.alert("Errore", "Dati mancanti");
      addGara({ 
        id: Date.now().toString(), teamId: id as string, 
        avversario: newGara.avversario!, data: `${newGara.data}T${newGara.ora || '00:00'}:00`, 
        luogo: newGara.luogo || 'Da definire' 
      });
      setNewGara({ avversario: '', data: '', ora: '', luogo: '' });
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: team.nome,
        headerRight: () => (
          <View style={{flexDirection: 'row', gap: 15}}>
            <TouchableOpacity onPress={async () => { const d = await importFromCSV(); d && d.forEach(a => addAtleta({...a, teamId: id as string})); }}>
              <Database size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => exportToCSV(teamAtlete, 'Export_')}>
              <Share2 size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )
      }} />

      {/* TABBAR NAVIGATION */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, activeTab === 'ATLETE' && styles.tabActive]} onPress={() => setActiveTab('ATLETE')}>
          <Users size={20} color={activeTab === 'ATLETE' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'ATLETE' && styles.textActive]}>Atlete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, activeTab === 'GARE' && styles.tabActive]} onPress={() => setActiveTab('GARE')}>
          <Trophy size={20} color={activeTab === 'GARE' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'GARE' && styles.textActive]}>Gare</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ATLETE' ? (
        <FlatList
          data={teamAtlete}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const status = getAtletaStatus(item.certificatoMedico);
            const statusColors = { OK: '#4CAF50', WARN: '#FFC107', ALT: '#F44336', MISS: '#9E9E9E' };
            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
                  <View style={{flex: 1}}>
                    <Text style={styles.cardTitle}>{item.nome} {item.cognome}</Text>
                    <Text style={styles.cardSub}>Maglia: {item.maglia} • Scadenza: {item.certificatoMedico || 'N/D'}</Text>
                  </View>
                  <View style={styles.actionColumn}>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.telefono}`)}>
                      <Phone size={20} color={item.telefono ? "#007AFF" : "#CCC"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginTop: 10}} onPress={() => { if(item.docImage) { setSelectedImage(item.docImage); setViewerVisible(true); } else Alert.alert("Info", "Nessuna foto ID caricata"); }}>
                      <Contact2 size={20} color={item.docImage ? "#34C759" : "#CCC"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginTop: 10}} onPress={() => { if(item.certificatoFileUri) openFile(item.certificatoFileUri); else Alert.alert("Info", "Nessun certificato caricato"); }}>
                      <FileText size={20} color={item.certificatoFileUri ? "#FF9500" : "#CCC"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>Nessuna atleta inserita.</Text>}
        />
      ) : (
        <View style={{flex: 1}}>
          <TouchableOpacity style={styles.shareHeaderBtn} onPress={handleShareGare}>
            <Share2 size={18} color="#007AFF" />
            <Text style={styles.shareHeaderText}>Condividi Calendario</Text>
          </TouchableOpacity>
          <FlatList
            data={teamGare}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.cardGara}>
                <View style={styles.garaHeader}>
                  <CalIcon size={14} color="#007AFF" />
                  <Text style={styles.garaDate}>{format(parseISO(item.data), "eeee dd MMMM", { locale: it })}</Text>
                  <Clock size={14} color="#007AFF" style={{marginLeft: 10}} />
                  <Text style={styles.garaDate}>{format(parseISO(item.data), "HH:mm")}</Text>
                </View>
                <Text style={styles.garaOpponent}>vs {item.avversario}</Text>
                <View style={styles.row}><MapPin size={14} color="#8E8E93" /><Text style={styles.cardSub}>{item.luogo}</Text></View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Nessuna gara programmata.</Text>}
          />
        </View>
      )}

      {/* IMAGE VIEWER MODAL */}
      <Modal visible={viewerVisible} transparent={true} animationType="fade">
        <View style={styles.viewerContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setViewerVisible(false)}>
            <X size={32} color="white" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="white" size={32} />
      </TouchableOpacity>

      {/* FORM MODAL (UNIVERSALE) */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalHeader}>{activeTab === 'ATLETE' ? "Nuova Atleta" : "Nuova Gara"}</Text>
            
            {activeTab === 'ATLETE' ? (
              <>
                <TextInput placeholder="Nome" style={styles.input} onChangeText={(t) => setNewAtleta({...newAtleta, nome: t})} />
                <TextInput placeholder="Cognome" style={styles.input} onChangeText={(t) => setNewAtleta({...newAtleta, cognome: t})} />
                <TextInput placeholder="Telefono (es: 3331234567)" style={styles.input} keyboardType="phone-pad" onChangeText={(t) => setNewAtleta({...newAtleta, telefono: t})} />
                <TextInput placeholder="Numero Maglia" style={styles.input} keyboardType="numeric" onChangeText={(t) => setNewAtleta({...newAtleta, maglia: t})} />
                <Text style={styles.label}>Scadenza Certificato (AAAA-MM-GG)</Text>
                <TextInput placeholder="Es: 2025-06-30" style={styles.input} onChangeText={(t) => setNewAtleta({...newAtleta, certificatoMedico: t})} />
                
                <Text style={styles.label}>Documenti & Certificati</Text>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickFile('doc')}>
                    <Upload size={18} color={newAtleta.docImage ? "#34C759" : "#666"} />
                    <Text style={styles.uploadText}>{newAtleta.docImage ? "Foto OK ✅" : "Carica ID"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickFile('cert')}>
                    <FileText size={18} color={newAtleta.certificatoFileUri ? "#FF9500" : "#666"} />
                    <Text style={styles.uploadText}>{newAtleta.certificatoFileUri ? "Cert. OK ✅" : "Carica Cert."}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TextInput placeholder="Avversario" style={styles.input} onChangeText={(t) => setNewGara({...newGara, avversario: t})} />
                <TextInput placeholder="Luogo" style={styles.input} onChangeText={(t) => setNewGara({...newGara, luogo: t})} />
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TextInput placeholder="Data (AAAA-MM-GG)" style={[styles.input, {flex: 1}]} onChangeText={(t) => setNewGara({...newGara, data: t})} />
                  <TextInput placeholder="Ora (HH:MM)" style={[styles.input, {flex: 1}]} onChangeText={(t) => setNewGara({...newGara, ora: t})} />
                </View>
              </>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, {backgroundColor: '#FF3B30'}]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, {backgroundColor: '#007AFF'}]} onPress={handleSave}>
                <Text style={styles.btnText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  textActive: { color: '#007AFF' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, marginHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardGara: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, marginHorizontal: 16, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  garaHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  garaDate: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', textTransform: 'capitalize' },
  garaOpponent: { fontSize: 18, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { fontSize: 13, color: '#8E8E93' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  actionColumn: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#F2F2F7', alignItems: 'center' },
  shareHeaderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: '#007AFF' },
  shareHeaderText: { color: '#007AFF', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#007AFF', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalView: { flex: 1, marginTop: 50, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#8E8E93', marginBottom: 10, marginTop: 15 },
  input: { backgroundColor: '#F2F2F7', padding: 14, borderRadius: 10, marginBottom: 10, fontSize: 16 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, backgroundColor: '#F2F2F7', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  uploadText: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 15, marginTop: 30, marginBottom: 40 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '80%' },
  closeBtn: { position: 'absolute', top: 50, right: 25, zIndex: 10 },
  empty: { textAlign: 'center', marginTop: 40, color: '#8E8E93' }
});

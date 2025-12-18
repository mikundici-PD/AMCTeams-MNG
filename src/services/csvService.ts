import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';

export const exportToCSV = async (data: any[], prefix: string) => {
  if (data.length === 0) return alert("Nessun dato da esportare");

  // Creazione header dai nomi delle chiavi
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${val}"`).join(',')
  ).join('\n');
  
  const csvContent = `${headers}\n${rows}`;
  const fileName = `${prefix}${format(new Date(), 'ddMMyyyyHHmmss')}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  try {
    await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(filePath);
  } catch (e) {
    console.error(e);
    alert("Errore durante l'esportazione");
  }
};

export const importFromCSV = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/comma-separated-values' });
    if (result.canceled) return null;

    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex per gestire virgole dentro le virgolette
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.replace(/"/g, '').trim();
      });
      return obj;
    });

    return data.filter(item => item.id); // Filtra righe vuote
  } catch (e) {
    console.error(e);
    alert("Errore durante l'importazione");
    return null;
  }
};

import * as ImagePicker from 'expo-image-picker';

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permesso negato per la galleria!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.5, // Ridotto per non appesantire AsyncStorage
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};

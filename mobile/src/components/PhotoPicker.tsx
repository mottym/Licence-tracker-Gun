import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

export interface PickedAsset {
  uri: string;
  mimeType: string;
}

interface PhotoPickerProps {
  label: string;
  helperText?: string;
  initialUri?: string | null;
  onPicked: (asset: PickedAsset | null) => void;
}

export function PhotoPicker({ label, helperText, initialUri, onPicked }: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | null>(initialUri ?? null);
  const [removed, setRemoved] = useState(false);

  const pick = async (source: "library" | "camera") => {
    if (source === "library") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
    } else {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? "Images",
      quality: 0.85,
      base64: false,
    };

    const result =
      source === "library"
        ? await ImagePicker.launchImageLibraryAsync(options)
        : await ImagePicker.launchCameraAsync(options);

    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? "image/jpeg";
    setPreview(asset.uri);
    setRemoved(false);
    onPicked({ uri: asset.uri, mimeType });
  };

  const clear = () => {
    setPreview(null);
    setRemoved(true);
    onPicked(null);
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
      {helperText ? (
        <Text variant="bodySmall" style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
      {preview && !removed ? (
        <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={[styles.preview, styles.placeholder]}>
          <Text variant="bodySmall" style={styles.placeholderText}>
            No photo selected
          </Text>
        </View>
      )}
      <View style={styles.actions}>
        <Button mode="outlined" icon="image" onPress={() => pick("library")}>
          Gallery
        </Button>
        <Button mode="outlined" icon="camera" onPress={() => pick("camera")}>
          Camera
        </Button>
        {preview && !removed ? (
          <Button mode="text" icon="trash-can" onPress={clear}>
            Remove
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontWeight: "600",
  },
  helper: {
    color: "#64748b",
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#94a3b8",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
});

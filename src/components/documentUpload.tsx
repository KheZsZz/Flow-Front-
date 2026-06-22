import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { api } from "@/services/api";
import { buildUploadForm } from "@/services/upload";

interface Props {
  label: string;
  entity: "vehicles" | "drivers";
  type: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  theme: any;
}

export function DocumentUpload({
  label,
  entity,
  type,
  currentUrl,
  onUploaded,
  theme,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl ?? null);

  const pick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);

      const form = await buildUploadForm("file", {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      });

      const { data } = await api.post(`/upload/${entity}/${type}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLocalUrl(data.url);
      onUploaded(data.url);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const openDoc = () => {
    if (localUrl) Linking.openURL(localUrl);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: theme.textSecondary ?? theme.text,
          fontSize: 12,
          marginBottom: 6,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <TouchableOpacity
          onPress={pick}
          disabled={uploading}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: localUrl
              ? theme.primary
              : theme.borderColor ?? "#ccc",
            backgroundColor: localUrl ? theme.primary + "12" : "transparent",
          }}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Feather
              name={localUrl ? "check-circle" : "upload"}
              size={16}
              color={localUrl ? theme.primary : theme.textSecondary ?? "#888"}
            />
          )}
          <Text
            style={{
              flex: 1,
              color: localUrl
                ? theme.primary
                : theme.textSecondary ?? "#888",
              fontSize: 13,
            }}
            numberOfLines={1}
          >
            {uploading
              ? "Enviando..."
              : localUrl
              ? "Documento enviado — clique para substituir"
              : "Selecionar arquivo (PDF, JPG, PNG)"}
          </Text>
        </TouchableOpacity>

        {localUrl && (
          <TouchableOpacity
            onPress={openDoc}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: theme.primary + "18",
            }}
          >
            <Feather name="eye" size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/contexts/themeContext";
import { invoiceService } from "@/services/invoices";

export default function UploadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/xml",
        multiple: true,
      });

      if (!result.canceled) {
        setFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      await invoiceService.uploadXMLs(files);
      Alert.alert("Sucesso", "Notas importadas com sucesso!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar arquivos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 15,
          }}
        >
          Importar XML
        </Text>
      </View>

      <TouchableOpacity
        onPress={pickDocument}
        style={{
          borderWidth: 2,
          borderColor: theme.primary,
          borderStyle: "dashed",
          padding: 40,
          borderRadius: 15,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Feather name="upload-cloud" size={40} color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
          Toque para selecionar arquivos
        </Text>
      </TouchableOpacity>

      <FlatList
        data={files}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              padding: 15,
              backgroundColor: theme.card,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Feather name="file-text" size={20} color={theme.primary} />
            <Text style={{ color: theme.text, marginLeft: 10 }}>
              {item.name}
            </Text>
          </View>
        )}
      />

      {files.length > 0 && (
        <TouchableOpacity
          onPress={handleUpload}
          disabled={loading}
          style={{
            backgroundColor: theme.primary,
            padding: 20,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>
              Processar {files.length} Notas
            </Text>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

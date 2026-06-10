import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/contexts/themeContext";
import {
  invoiceService,
  UploadResult,
  UploadStatus,
} from "@/services/invoices";

import {
  STATUS_CONFIG,
  createInvoiceUploadStyles,
} from "@/styles/invoices.styles";
import rollback from "@/services/rollback";

export default function UploadScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme, isDark } = useTheme();
  const [files, setFiles] = useState<any[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [loading, setLoading] = useState(false);

  const metrics = {
    success: results.filter((r) => r.status === "success").length,
    duplicate: results.filter((r) => r.status === "duplicate").length,
    error: results.filter((r) => r.status === "error").length,
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (results.length > 0) {
      setResults([]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/xml", "text/xml", "*/*"],
      multiple: true,
    });
    if (!result.canceled) {
      setFiles((prev) => [...prev, ...result.assets]);
      setResults([]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      const uploadResults = await invoiceService.uploadXMLs(files);
      setResults(uploadResults);
      const failedFiles = uploadResults
        .filter((r) => r.status === "error")
        .map((r) => r.file);
      setFiles((prev) => prev.filter((f) => failedFiles.includes(f.name)));
    } finally {
      setLoading(false);
    }
  };

  const isMobile = width < 820;
  const styles = createInvoiceUploadStyles(theme, isMobile);

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather
            name="chevron-left"
            size={24}
            color={theme.isDark ? theme.text : theme.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Importar XML</Text>
      </View>

      <TouchableOpacity onPress={pickDocument} style={[styles.dropzone]}>
        <Feather
          name="upload-cloud"
          size={40}
          color={theme.isDark ? theme.text : theme.primary}
        />
        <Text style={[styles.dropzoneText]}>
          {files.length > 0
            ? `${files.length} arquivo(s) selecionado(s) — toque para adicionar mais`
            : "Toque para selecionar arquivos XML"}
        </Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.metricsRow}>
          {(["success", "duplicate", "error"] as UploadStatus[]).map((key) => {
            const cfg = STATUS_CONFIG[key];
            return (
              <View
                key={key}
                style={[
                  styles.metricCard,
                  { backgroundColor: cardBg, borderColor: cfg.color },
                ]}
              >
                <Text style={[styles.metricNumber, { color: cfg.color }]}>
                  {metrics[key]}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: theme.textSecondary }]}
                >
                  {cfg.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.ListContent}>
        <FlatList
          data={results.length > 0 ? results : files}
          keyExtractor={(_, i) => i.toString()}
          style={[styles.fileList]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            if (results.length === 0) {
              return (
                <View style={[styles.fileRow]}>
                  <Feather
                    name="file-text"
                    size={20}
                    color={theme.isDark ? theme.success : theme.primary}
                  />
                  <Text style={[styles.fileName]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    style={[styles.removeButton]}
                    onPress={() => removeFile(index)}
                  >
                    <Feather name="trash-2" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            }

            // Resultado após upload
            const result = item as UploadResult;
            const cfg = STATUS_CONFIG[result.status];

            return (
              <View
                style={[
                  styles.fileRow,
                  {
                    backgroundColor: cardBg,
                    borderLeftColor: cfg.color,
                    borderLeftWidth: 3,
                  },
                ]}
              >
                <Feather name={cfg.icon as any} size={18} color={cfg.color} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={[styles.fileName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {result.file}
                  </Text>
                  <Text style={[styles.fileMessage, { color: cfg.color }]}>
                    {result.message}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      {files.length > 0 && (
        <TouchableOpacity
          onPress={handleUpload}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="upload" size={18} color="#FFF" />
              <Text style={styles.buttonText}>
                Processar {files.length} {files.length === 1 ? "nota" : "notas"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

import { useTheme } from "@/contexts/themeContext";
import { createInvoiceListStyles } from "@/styles/modal.styles";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ModalProps,
  useWindowDimensions,
} from "react-native";

interface ConfirmModalProps extends ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const isMobile = useWindowDimensions().width < 768;
  const { theme } = useTheme();
  const styles = createInvoiceListStyles(theme, isMobile);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.btnCancel]}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, styles.btnConfirm]}
            >
              <Text style={{ color: "#fff" }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

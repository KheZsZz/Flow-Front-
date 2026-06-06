import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/services/api";

interface InvoiceItem {
  invoice_id: string;
  type_orders: "Coleta" | "Entrega/Coleta" | "Retorno Vazio";
  tracking: string;
  status_id: string;
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados principais da Ordem
  const [statusId, setStatusId] = useState("UUID_STATUS_EM_ABERTO"); // Pré-fixado no código ou via select
  const [driverId, setDriverId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");

  // Regra de Negócio: Até 3 veículos/placas
  const [vehicles, setVehicles] = useState<string[]>([""]);

  // Itens/Invoices vinculadas
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Funções manipuladoras para os Veículos (Máximo 3)
  const handleAddVehicleField = () => {
    if (vehicles.length < 3) setVehicles([...vehicles, ""]);
  };

  const handleVehicleChange = (text: string, index: number) => {
    const updated = [...vehicles];
    updated[index] = text;
    setVehicles(updated);
  };

  // Funções manipuladoras para as Invoices/Itens
  const handleAddInvoiceItem = () => {
    setItems([
      ...items,
      {
        invoice_id: "",
        type_orders: "Entrega/Coleta",
        tracking: "",
        status_id: "UUID_STATUS_ITEM",
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Envio do payload idêntico ao esperado pela sua RPC/API
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Filtra campos vazios do array de veículos antes de enviar
      const filteredVehicles = vehicles.filter((v) => v.trim() !== "");

      const payload = {
        status_id: statusId,
        driver_id: driverId,
        delivery_date: deliveryDate,
        notes: notes || null,
        vehicles: filteredVehicles, // Envia o array de strings (UUIDs)
        items: items,
      };

      const response = await api.post("/orders", payload);

      if (response.status === 201) {
        alert("Ordem emitida com sucesso!");
        router.push("/orders/");
      }
    } catch (error: any) {
      alert(
        `Erro ao emitir ordem: ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Emitir Nova Ordem de Serviço</Text>

      {/* Dados Gerais */}
      <Text style={styles.sectionTitle}>1. Informações Gerais</Text>
      <TextInput
        style={styles.input}
        placeholder="ID do Motorista (UUID)"
        value={driverId}
        onChangeText={setDriverId}
      />
      <TextInput
        style={styles.input}
        placeholder="Notas / Instruções de Carga"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Sessão Dinâmica de Veículos (Composição de Placas) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          2. Veículos / Composição ({vehicles.length}/3)
        </Text>
        {vehicles.length < 3 && (
          <TouchableOpacity
            onPress={handleAddVehicleField}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Reboque</Text>
          </TouchableOpacity>
        )}
      </View>

      {vehicles.map((vehicle, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={
            index === 0
              ? "ID do Veículo Principal (Cavalo/Vuc)"
              : `ID do ${index + 1}º Reboque`
          }
          value={vehicle}
          onChangeText={(text) => handleVehicleChange(text, index)}
        />
      ))}

      {/* Sessão Dinâmica de Notas Fiscais */}
      <div style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          3. Notas Fiscais e Itens ({items.length})
        </Text>
        <TouchableOpacity
          onPress={handleAddInvoiceItem}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Vincular NF</Text>
        </TouchableOpacity>
      </div>

      {items.map((item, index) => (
        <View key={index} style={styles.cardItem}>
          <TextInput
            style={styles.input}
            placeholder="ID da Invoice/Nota Fiscal"
            value={item.invoice_id}
            onChangeText={(text) => handleItemChange(index, "invoice_id", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Código de Rastreio (Tracking)"
            value={item.tracking}
            onChangeText={(text) => handleItemChange(index, "tracking", text)}
          />
        </View>
      ))}

      {/* Ação de Emissão */}
      <View style={{ marginTop: 20 }}>
        <Button
          title={loading ? "Processando..." : "Emitir Ordem"}
          onPress={handleSubmit}
          disabled={loading}
          color="#0070f3"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  cardItem: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addButton: {
    backgroundColor: "#e0f2fe",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: { color: "#0369a1", fontWeight: "500", fontSize: 12 },
});

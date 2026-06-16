import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { useWindowDimensions } from "react-native";
import { createOrderFormStyles } from "@/styles/ordens.styles";
import { PickerModal, PickerOption } from "@/components/Pickermodal";
import { orderService } from "@/services/orders";
import { collectionService } from "@/services/collections";
import { api } from "@/services/api";

export interface OrderItemDraft {
  key: string;
  invoice_id?: string;
  collection_id?: string;
  label: string;
  sublabel?: string;
  type_orders: string;
  tracking?: string;
  existing?: boolean;
  orderItemId?: string;
  locked?: boolean;
}

type Mode = "nf" | "barcode" | "system" | "collection";

const MODES: { key: Mode; label: string }[] = [
  { key: "nf", label: "Nº da NF" },
  { key: "barcode", label: "Cód. barras" },
  { key: "system", label: "Consulta" },
  { key: "collection", label: "Coleta" },
];

const uid = () => Math.random().toString(36).slice(2);

export function AddInvoiceItems({
  items,
  onChange,
  typeOptions,
  disabled,
}: {
  items: OrderItemDraft[];
  onChange: (items: OrderItemDraft[]) => void;
  typeOptions: string[];
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createOrderFormStyles(theme, isMobile);

  const [mode, setMode] = useState<Mode>("nf");
  const [nf, setNf] = useState("");
  const [barcode, setBarcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const defaultType = (forCollection = false) => {
    if (forCollection && typeOptions.includes("Coleta")) return "Coleta";
    return typeOptions[0] ?? "Entrega";
  };

  const addInvoice = (inv: any) => {
    if (!inv?.id) {
      Alert.alert("Não encontrado", "Nenhuma nota localizada.");
      return;
    }
    if (items.some((i) => i.invoice_id === inv.id)) {
      Alert.alert("Duplicado", "Essa nota já está na viagem.");
      return;
    }
    onChange([
      ...items,
      {
        key: uid(),
        invoice_id: inv.id,
        label: `NFe ${inv.nfe ?? "—"}`,
        sublabel: inv.value_nfe != null ? `R$ ${inv.value_nfe}` : undefined,
        type_orders: defaultType(false),
        tracking: "",
      },
    ]);
  };

  const addCollection = (opt: PickerOption) => {
    if (items.some((i) => i.collection_id === opt.id)) {
      Alert.alert("Duplicado", "Essa coleta já está na viagem.");
      return;
    }
    onChange([
      ...items,
      {
        key: uid(),
        collection_id: opt.id,
        label: opt.label,
        sublabel: opt.sublabel,
        type_orders: defaultType(true),
        tracking: "",
      },
    ]);
  };

  const searchNf = async () => {
    if (!nf.trim()) return;
    setBusy(true);
    try {
      const res = await orderService.findInvoiceByNfe(nf.trim());
      addInvoice(Array.isArray(res) ? res[0] : res);
      setNf("");
    } catch {
      Alert.alert("Não encontrado", "Nota não localizada por esse número.");
    } finally {
      setBusy(false);
    }
  };

  const searchBarcode = async () => {
    if (!barcode.trim()) return;
    setBusy(true);
    try {
      const res = await orderService.findInvoiceByBarcode(barcode.trim());
      addInvoice(Array.isArray(res) ? res[0] : res);
      setBarcode("");
    } catch {
      Alert.alert("Não encontrado", "Nota não localizada por esse código.");
    } finally {
      setBusy(false);
    }
  };

  const update = (key: string, patch: Partial<OrderItemDraft>) =>
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const remove = (key: string) => onChange(items.filter((i) => i.key !== key));

  return (
    <View>
      <View style={styles.segmented}>
        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setMode(m.key)}
              disabled={disabled}
            >
              <Text
                style={active ? styles.segmentTextActive : styles.segmentText}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === "nf" && (
        <View style={styles.lookupRow}>
          <TextInput
            placeholder="Digite o número da NF"
            placeholderTextColor={theme.textSecondary}
            style={styles.lookupInput}
            value={nf}
            onChangeText={setNf}
            keyboardType="numeric"
            editable={!disabled}
          />
          <TouchableOpacity
            style={styles.lookupBtn}
            onPress={searchNf}
            disabled={disabled || busy}
          >
            <Text style={styles.lookupBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "barcode" && (
        <View style={styles.lookupRow}>
          <TextInput
            placeholder="Leia ou digite o código de barras"
            placeholderTextColor={theme.textSecondary}
            style={styles.lookupInput}
            value={barcode}
            onChangeText={setBarcode}
            editable={!disabled}
          />
          <TouchableOpacity
            style={styles.lookupBtn}
            onPress={searchBarcode}
            disabled={disabled || busy}
          >
            <Text style={styles.lookupBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "system" && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setSystemOpen(true)}
          disabled={disabled}
        >
          <Feather
            name="search"
            size={16}
            color={theme.isDark ? theme.link : theme.primary}
          />
          <Text style={styles.addBtnText}>Buscar nota no sistema</Text>
        </TouchableOpacity>
      )}

      {mode === "collection" && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCollectionOpen(true)}
          disabled={disabled}
        >
          <Feather
            name="package"
            size={16}
            color={theme.isDark ? theme.link : theme.primary}
          />
          <Text style={styles.addBtnText}>Selecionar coleta disponível</Text>
        </TouchableOpacity>
      )}

      {/* itens já adicionados */}
      {items.map((it) => (
        <View key={it.key} style={styles.itemCard}>
          <View style={styles.itemTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>{it.label}</Text>
              {!!it.sublabel && (
                <Text style={styles.itemSub}>{it.sublabel}</Text>
              )}
            </View>
            {it.locked ? (
              <Text style={styles.lockTag}>Concluída</Text>
            ) : (
              !disabled && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => remove(it.key)}
                >
                  <Feather name="trash-2" size={18} color={theme.error} />
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.chipRow}>
            {typeOptions.map((opt) => {
              const active = it.type_orders === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() =>
                    !disabled &&
                    !it.locked &&
                    update(it.key, { type_orders: opt })
                  }
                  disabled={disabled || it.locked}
                >
                  <Text
                    style={active ? styles.chipTextActive : styles.chipText}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            placeholder="Rastreio (opcional)"
            placeholderTextColor={theme.textSecondary}
            style={styles.trackingInput}
            value={it.tracking}
            onChangeText={(t) => update(it.key, { tracking: t })}
            editable={!disabled && !it.locked}
          />
        </View>
      ))}

      <PickerModal
        visible={systemOpen}
        title="Notas no sistema"
        onClose={() => setSystemOpen(false)}
        onSelect={(opt) => addInvoice(opt.raw)}
        load={async () => {
          const { data } = await api.get("/invoices");
          return (Array.isArray(data) ? data : []).map((inv: any) => ({
            id: inv.id,
            label: `NFe ${inv.nfe ?? "—"}`,
            sublabel: inv.value_nfe != null ? `R$ ${inv.value_nfe}` : undefined,
            raw: inv,
          }));
        }}
      />

      <PickerModal
        visible={collectionOpen}
        title="Coletas disponíveis"
        onClose={() => setCollectionOpen(false)}
        onSelect={addCollection}
        load={async () => {
          const data = await collectionService.list(true);
          return (Array.isArray(data) ? data : []).map((c: any) => ({
            id: c.id,
            label: c.code,
            sublabel: c.clients?.name_client,
            raw: c,
          }));
        }}
      />
    </View>
  );
}

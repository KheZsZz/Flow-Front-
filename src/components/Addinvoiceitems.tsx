import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { ControlledInput } from "@/components/controllerInput";
import { createOrdersItensStyles } from "@/styles/orders.styles";
import { orderService } from "@/services/orders";
import { collectionService } from "@/services/collections";
import { api } from "@/services/api";
import { InvoiceTypes } from "@/schemas/invoicesSchema";

export interface OrderItemDraft {
  key: string;
  invoice_id?: string;
  collection_id?: string;
  label: string;
  sublabel?: string;
  type_orders: string;
  existing?: boolean;
  orderItemId?: string;
  locked?: boolean;
}

type Mode = "search" | "nf" | "barcode" | "collection";

const MODES: { key: Mode; label: string }[] = [
  { key: "search", label: "Buscar nota" },
  { key: "nf", label: "Nº NF" },
  { key: "barcode", label: "Cód. barras" },
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
  const isMobile = useWindowDimensions().width < 820;
  const styles = createOrdersItensStyles(theme, isMobile);

  const [mode, setMode] = useState<Mode>("search");
  const [busy, setBusy] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const { control, watch, setValue } = useForm({
    defaultValues: { nf: "", barcode: "", search: "" },
  });

  const nf = watch("nf");
  const barcode = watch("barcode");
  const search = watch("search");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/invoices");
        setInvoices(Array.isArray(data) ? data : []);
      } catch {
        /* autocomplete vazio */
      }
      try {
        const d = await collectionService.list(true);
        setCollections(Array.isArray(d) ? d : []);
      } catch {
        /* sem coletas */
      }
    })();
  }, []);

  const defaultType = (forCollection = false) =>
    forCollection && typeOptions.includes("Coleta")
      ? "Coleta"
      : (typeOptions[0] ?? "Coleta");

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
      },
    ]);
  };

  const addCollection = (c: any) => {
    if (items.some((i) => i.collection_id === c.id)) {
      Alert.alert("Duplicado", "Essa coleta já está na viagem.");
      return;
    }
    onChange([
      ...items,
      {
        key: uid(),
        collection_id: c.id,
        label: c.code,
        sublabel: c.clients?.name_client,
        type_orders: defaultType(true),
      },
    ]);
  };

  const searchNf = async () => {
    if (!nf.trim()) return;
    setBusy(true);
    try {
      const res = await orderService.findInvoiceByNfe(nf.trim());
      addInvoice(Array.isArray(res) ? res[0] : res);
      setValue("nf", "");
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
      setValue("barcode", "");
    } catch {
      Alert.alert("Não encontrado", "Nota não localizada por esse código.");
    } finally {
      setBusy(false);
    }
  };

  const q = (search ?? "").trim().toLowerCase();
  const invoiceMatches = useMemo(
    () =>
      !q
        ? []
        : invoices
            .filter((i) =>
              String(i.nfe ?? "")
                .toLowerCase()
                .includes(q),
            )
            .slice(0, 8),
    [invoices, q],
  );
  const collectionMatches = useMemo(
    () =>
      (!q
        ? collections
        : collections.filter(
            (c) =>
              c.code?.toLowerCase().includes(q) ||
              c.clients?.name_client?.toLowerCase().includes(q),
          )
      ).slice(0, 8),
    [collections, q],
  );

  const update = (key: string, patch: Partial<OrderItemDraft>) =>
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const remove = (key: string) => onChange(items.filter((i) => i.key !== key));

  return (
    <View>
      {!disabled && (
        <>
          <View style={styles.segmented}>
            {MODES.map((m) => {
              const active = mode === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setMode(m.key)}
                >
                  <Text
                    style={
                      active ? styles.segmentTextActive : styles.segmentText
                    }
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === "nf" && (
            <>
              <ControlledInput
                control={control}
                name="nf"
                label="Número da NF"
                placeholder="Digite o número e busque"
                iconName="hashtag"
                variant="numeric"
              />
              <TouchableOpacity
                style={styles.lookupBtn}
                onPress={searchNf}
                disabled={busy}
              >
                <Text style={styles.lookupBtnText}>Buscar nota</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "barcode" && (
            <>
              <ControlledInput
                control={control}
                name="barcode"
                label="Código de barras"
                placeholder="Leia ou digite o código"
                iconName="barcode"
              />
              <TouchableOpacity
                style={styles.lookupBtn}
                onPress={searchBarcode}
                disabled={busy}
              >
                <Text style={styles.lookupBtnText}>Buscar nota</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "search" && (
            <>
              <ControlledInput
                control={control}
                name="search"
                label="Buscar nota (nº NF)"
                placeholder="Digite para filtrar..."
                iconName="magnifying-glass"
              />
              {q.length > 0 && (
                <View style={styles.acBox}>
                  {invoiceMatches.length === 0 ? (
                    <Text style={styles.acEmpty}>Nenhuma nota encontrada.</Text>
                  ) : (
                    invoiceMatches.map((inv: InvoiceTypes) => (
                      <TouchableOpacity
                        key={inv.id}
                        style={styles.acResult}
                        onPress={() => {
                          addInvoice(inv);
                          setValue("search", "");
                        }}
                      >
                        <Text style={styles.acResultText}>
                          NFe {inv.nfe ?? "—"}
                        </Text>
                        {inv.remetente.name_client != null && (
                          <Text style={styles.acResultSub}>
                            {inv.remetente.name_client}
                          </Text>
                        )}

                        {inv.destinatario.name_client != null && (
                          <Text style={styles.acResultSub}>
                            {inv.destinatario.name_client}
                          </Text>
                        )}
                        {inv.value_nfe != null && (
                          <Text style={styles.acResultSub}>
                            R$ {inv.value_nfe}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </>
          )}

          {mode === "collection" && (
            <>
              <ControlledInput
                control={control}
                name="search"
                label="Buscar coleta (código ou cliente)"
                placeholder="Digite para filtrar..."
                iconName="magnifying-glass"
              />
              <View style={styles.acBox}>
                {collectionMatches.length === 0 ? (
                  <Text style={styles.acEmpty}>Nenhuma coleta disponível.</Text>
                ) : (
                  collectionMatches.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.acResult}
                      onPress={() => {
                        addCollection(c);
                        setValue("search", "");
                      }}
                    >
                      <Text style={styles.acResultText}>{c.code}</Text>
                      {!!c.clients?.name_client && (
                        <Text style={styles.acResultSub}>
                          {c.clients.name_client}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          )}
        </>
      )}

      {/* itens adicionados */}
      {items.map((it) => (
        <View key={it.key} style={styles.itemCard}>
          <View style={styles.itemTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>{it.label}</Text>
              {!!it.sublabel && (
                <Text style={styles.itemSub}>{it.type_orders}</Text>
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
                  <Feather
                    name="trash-2"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

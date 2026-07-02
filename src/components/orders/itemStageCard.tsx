import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { STATUS_CODE, nextDriverStage } from "@/services/orders";

const STAGE_COLOR: Record<number, { bg: string; fg: string }> = {
  [STATUS_CODE.EM_ABERTO]: { bg: "#e5e7eb", fg: "#374151" },
  [STATUS_CODE.EM_ROTA]: { bg: "#dbeafe", fg: "#1d4ed8" },
  [STATUS_CODE.CHEGADA_CLIENTE]: { bg: "#fef3c7", fg: "#b45309" },
  [STATUS_CODE.ENTREGA_REALIZADA]: { bg: "#dcfce7", fg: "#15803d" },
  [STATUS_CODE.COLETA_REALIZADA]: { bg: "#dcfce7", fg: "#15803d" },
  [STATUS_CODE.AGUARDANDO_CANHOTO]: { bg: "#ffedd5", fg: "#c2410c" },
  [STATUS_CODE.CONCLUIDO]: { bg: "#bbf7d0", fg: "#166534" },
};

const pad = (n: number) => String(n).padStart(2, "0");

const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(
    d.getFullYear(),
  ).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toEditableDateTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

// "DD/MM/AAAA HH:mm" -> Date | null
const parseEditableDateTime = (s: string): Date | null => {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, hh, min] = m;
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
  );
  return isNaN(d.getTime()) ? null : d;
};

interface Props {
  item: any;
  busy?: boolean;
  onAdvance: (item: any, nextCode: number, location?: string) => void;
  /** dispara o seletor de arquivo + upload do canhoto (item em 200) */
  onSendCanhoto?: (item: any) => void;
  /** habilita edição de data/hora/local dos eventos (Manager/Admin/Requestor) */
  canEditEvents?: boolean;
  onEditEvent?: (
    eventId: string,
    payload: { created_at?: string; location_item?: string },
  ) => void;
}

export function ItemStageCard({
  item,
  busy,
  onAdvance,
  onSendCanhoto,
  canEditEvents,
  onEditEvent,
}: Props) {
  const { theme } = useTheme();
  const [showLocation, setShowLocation] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [location, setLocation] = useState("");

  // edição de evento
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editLoc, setEditLoc] = useState("");
  const [editErr, setEditErr] = useState<string | null>(null);

  const isColeta = !!item?.collections || !!item?.collection_id;
  const label = isColeta
    ? `Coleta ${item?.collections?.code ?? "—"}`
    : `NFe ${item?.invoices?.nfe ?? "—"}`;
  const sub = isColeta
    ? (item?.collections?.description ?? "")
    : (item?.invoices?.destinatario?.name_client ?? "");

  const code = item?.status?.code as number | undefined;
  const stageName = item?.status?.name ?? "—";
  const color = (code != null && STAGE_COLOR[code]) || {
    bg: "#e5e7eb",
    fg: "#374151",
  };

  const next = nextDriverStage(item);
  const awaitingCanhoto = code === STATUS_CODE.AGUARDANDO_CANHOTO;

  const events = useMemo(
    () =>
      [...(item?.trackingevents ?? [])].sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [item?.trackingevents],
  );

  const handleAdvance = () => {
    if (!next) return;
    if (next.code === STATUS_CODE.CHEGADA_CLIENTE) {
      setShowLocation(true);
      return;
    }
    onAdvance(item, next.code);
  };

  const confirmChegada = () => {
    onAdvance(item, STATUS_CODE.CHEGADA_CLIENTE, location.trim() || undefined);
    setShowLocation(false);
    setLocation("");
  };

  const openEdit = (ev: any) => {
    setEditingEvent(ev);
    setEditDate(toEditableDateTime(ev.created_at));
    setEditLoc(ev.location_item ?? "");
    setEditErr(null);
  };

  const saveEdit = () => {
    if (!editingEvent || !onEditEvent) return;
    const parsed = parseEditableDateTime(editDate);
    if (!parsed) {
      setEditErr("Use o formato DD/MM/AAAA HH:mm");
      return;
    }
    onEditEvent(editingEvent.id, {
      created_at: parsed.toISOString(),
      location_item: editLoc.trim(),
    });
    setEditingEvent(null);
  };

  const cardBg = theme.isDark ? "#1f2937" : "#fff";
  const border = theme.isDark ? "#374151" : "#e5e7eb";

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: border,
        padding: 14,
        marginBottom: 12,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: theme.text }}>
            {label}
          </Text>
          {!!sub && (
            <Text
              numberOfLines={1}
              style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}
            >
              {sub}
            </Text>
          )}
        </View>
        <View
          style={{
            backgroundColor: color.bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: color.fg, fontWeight: "700", fontSize: 12 }}>
            {stageName}
          </Text>
        </View>
      </View>

      {/* ação: avançar etapa OU enviar canhoto OU estado final */}
      {next ? (
        <TouchableOpacity
          disabled={busy}
          onPress={handleAdvance}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#2563eb",
            paddingVertical: 11,
            borderRadius: 10,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather
                name={
                  next.code === STATUS_CODE.CHEGADA_CLIENTE
                    ? "map-pin"
                    : "check-circle"
                }
                size={16}
                color="#fff"
              />
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {next.label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : awaitingCanhoto && onSendCanhoto ? (
        <TouchableOpacity
          disabled={busy}
          onPress={() => onSendCanhoto(item)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#c2410c",
            paddingVertical: 11,
            borderRadius: 10,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="upload" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Enviar canhoto
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <Text
          style={{ color: theme.textSecondary, fontSize: 12, fontStyle: "italic" }}
        >
          {code === STATUS_CODE.EM_ABERTO
            ? "Aguardando início da viagem."
            : code === STATUS_CODE.CONCLUIDO
              ? "Item concluído."
              : "Etapas do motorista concluídas."}
        </Text>
      )}

      {/* timeline */}
      <TouchableOpacity
        onPress={() => setShowTimeline((v) => !v)}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Feather
          name={showTimeline ? "chevron-up" : "chevron-down"}
          size={14}
          color={theme.textSecondary}
        />
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {events.length} evento(s) de rastreio
        </Text>
      </TouchableOpacity>

      {showTimeline && (
        <View style={{ gap: 8, paddingLeft: 4, marginTop: 2 }}>
          {events.length === 0 ? (
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Nenhum evento ainda.
            </Text>
          ) : (
            events.map((ev: any) => (
              <View
                key={ev.id}
                style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginTop: 5,
                    backgroundColor: STAGE_COLOR[ev.status?.code]?.fg ?? "#9ca3af",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}
                  >
                    {ev.status?.name ?? ev.description_item ?? "Evento"}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {fmtDateTime(ev.created_at)}
                    {ev.location_item ? ` · ${ev.location_item}` : ""}
                  </Text>
                </View>
                {canEditEvents && onEditEvent && (
                  <TouchableOpacity
                    onPress={() => openEdit(ev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 2 }}
                  >
                    <Feather name="edit-2" size={13} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* modal de localização (Chegada no Cliente) */}
      <Modal
        visible={showLocation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocation(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{ backgroundColor: cardBg, borderRadius: 14, padding: 18, gap: 12 }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, color: theme.text }}>
              Registrar chegada
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
              {label} — informe o local da chegada (opcional).
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Ex.: Doca 3, CD Guarulhos"
              placeholderTextColor={theme.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
              }}
            />
            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end" }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowLocation(false);
                  setLocation("");
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 14 }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmChegada}
                style={{
                  backgroundColor: "#2563eb",
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* modal de edição de evento (data/hora/local) */}
      <Modal
        visible={!!editingEvent}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingEvent(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{ backgroundColor: cardBg, borderRadius: 14, padding: 18, gap: 12 }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, color: theme.text }}>
              Editar evento
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
              {editingEvent?.status?.name ?? "Evento"} — ajuste a data/hora real
              e o local.
            </Text>

            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Data e hora
            </Text>
            <TextInput
              value={editDate}
              onChangeText={(t) => {
                setEditDate(t);
                setEditErr(null);
              }}
              placeholder="DD/MM/AAAA HH:mm"
              placeholderTextColor={theme.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: editErr ? "#ef4444" : border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
              }}
            />

            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Local</Text>
            <TextInput
              value={editLoc}
              onChangeText={setEditLoc}
              placeholder="Local do evento (opcional)"
              placeholderTextColor={theme.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
              }}
            />

            {editErr && (
              <Text style={{ color: "#ef4444", fontSize: 12 }}>{editErr}</Text>
            )}

            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end" }}
            >
              <TouchableOpacity
                onPress={() => setEditingEvent(null)}
                style={{ paddingVertical: 10, paddingHorizontal: 14 }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                style={{
                  backgroundColor: "#2563eb",
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

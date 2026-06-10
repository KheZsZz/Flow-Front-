import React from "react";
import rollback from "@/services/rollback";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceTypes } from "@/schemas/invoicesSchema";
import { useEffect, useState } from "react";
import { invoiceService } from "@/services/invoices";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { Loadding } from "@/components/loadding";
import { Button } from "@/components/button";
import { ControlledInput } from "@/components/controllerInput";
import { useForm } from "react-hook-form";
import { createInvoiceUpdateStyles } from "@/styles/invoices.styles";
import { useWindowDimensions, View, Text } from "react-native";

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createInvoiceUpdateStyles(theme, isMobile);

  const [data, setData] = useState<InvoiceTypes>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  useEffect(() => {
    invoiceService
      .getInvoiceById(id)
      .then((res) => {
        setData(res);
        reset(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar nota:", err);
        setLoading(false);
      });
  }, [id, reset]);

  const handleSave = async (data: InvoiceTypes) => {
    try {
      setSaving(true);
      await invoiceService.updateInvoice(id, data);
      rollback();
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <Loadding color={isDark ? theme.link : theme.text} size={50} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Nota Fiscal</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.contentInline}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Número da NFe"
              name="nfe"
              placeholder="Digite o número da NFe"
              variant="numeric"
              errorMessage={errors.nfe?.message}
            />
          </View>
          <View style={[styles.inputWrapper]}>
            <ControlledInput
              control={control}
              label="Serie"
              name="serie_nf"
              placeholder="Digite a série da NF-e"
              variant="numeric"
              maxLength={2}
              errorMessage={errors.serie_nf?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Natureza"
              name="nature_transaction"
              placeholder="Natureza da transação"
              errorMessage={errors.nature_transaction?.message}
            />
          </View>
        </View>
        <View style={styles.contentInline}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Data de Emissão"
              name="issue_date"
              placeholder="Digite a data de emissão"
              errorMessage={errors.issue_date?.message}
              variant="date"
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Valor da NF-e"
              name="value_nfe"
              placeholder="Digite o valor da NF-e"
              errorMessage={errors.value_nfe?.message}
              variant="numeric"
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Peso"
              name="weight_brute"
              placeholder="Digite o peso"
              errorMessage={errors.weight_brute?.message}
              variant="numeric"
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Quantidade"
              name="quantity_volumes"
              placeholder="Digite a quantidade"
              errorMessage={errors.quantity_volumes?.message}
              variant="numeric"
            />
          </View>
        </View>

        <View style={styles.contentInline}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="CT-e"
              name="cte"
              placeholder="Digite o CT-e"
              errorMessage={errors.cte?.message}
              variant="numeric"
            />
          </View>

          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Valor CT-e"
              name="cte_value"
              placeholder="Digite o valor do CT-e"
              errorMessage={errors.cte_value?.message}
              variant="numeric"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <ControlledInput
            control={control}
            label="Codigo de barras"
            name="barcode"
            placeholder="Digite o codigo de barras"
            errorMessage={errors.barcode?.message}
          />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Dados de Remente/Destinatário</Text>
      </View>

      {/*Table Client*/}
      <View style={styles.contentInline}>
        <View style={styles.tableClient}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Cnpj Emitente"
              name="destinatario.document"
              placeholder="Digite o CNPJ do emitente"
              errorMessage={errors.destinatario?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Nome Destinatário"
              name="destinatario.name_client"
              placeholder="Digite o nome do destinatário"
              errorMessage={errors.destinatario?.name_client?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="phone_user"
              name="destinatario.phone_user"
              placeholder="Digite o telefone"
              errorMessage={errors.destinatario?.phone_user?.message}
            />
          </View>
        </View>
      </View>

      <View style={styles.contentInline}>
        <View style={styles.inputWrapper}>
          <ControlledInput
            control={control}
            label="Observações"
            name="observation"
            placeholder=""
            errorMessage={errors.observation?.message}
          />
        </View>
      </View>

      <Button
        title={saving ? "Salvando..." : "Salvar Alterações"}
        onPress={handleSubmit(handleSave)}
        disabled={saving}
      />
    </View>
  );
}

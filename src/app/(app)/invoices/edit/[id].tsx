import React, { useEffect, useState } from "react";
import { useWindowDimensions, View, Text, ScrollView } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";

import rollback from "@/services/rollback";
import { invoiceService } from "@/services/invoices";
import { useTheme } from "@/contexts/themeContext";
import { invoiceSchema, InvoiceTypes } from "@/schemas/invoicesSchema";

import { Loadding } from "@/components/loadding";
import { Button } from "@/components/button";
import { ControlledInput } from "@/components/controllerInput";
import { createInvoiceUpdateStyles } from "@/styles/invoices.styles";

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createInvoiceUpdateStyles(theme, isMobile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  const [remetenteAddress, destinatarioAddress] = useWatch({
    control,
    name: ["remetente.address", "destinatario.address"],
  });

  useEffect(() => {
    if (!remetenteAddress) return;
    const { street, number, city, state, neighborhood } = remetenteAddress;

    const newFullAddress = [
      street,
      number ? `nº ${number}` : "S/N",
      neighborhood,
      city,
      state,
    ]
      .filter(Boolean)
      .join(", ");

    if (newFullAddress !== remetenteAddress.fullAddress) {
      setValue("remetente.address.fullAddress", newFullAddress, {
        shouldValidate: true,
      });
    }
  }, [
    remetenteAddress?.street,
    remetenteAddress?.number,
    remetenteAddress?.neighborhood,
    remetenteAddress?.city,
    remetenteAddress?.state,
    setValue,
  ]);

  useEffect(() => {
    if (!destinatarioAddress) return;
    const { street, number, city, state, neighborhood } = destinatarioAddress;

    const newFullAddress = [
      street,
      number ? `nº ${number}` : "S/N",
      neighborhood,
      city,
      state,
    ]
      .filter(Boolean)
      .join(", ");

    if (newFullAddress !== destinatarioAddress.fullAddress) {
      setValue("destinatario.address.fullAddress", newFullAddress, {
        shouldValidate: true,
      });
    }
  }, [
    destinatarioAddress?.street,
    destinatarioAddress?.number,
    destinatarioAddress?.neighborhood,
    destinatarioAddress?.city,
    destinatarioAddress?.state,
    setValue,
  ]);

  useEffect(() => {
    invoiceService
      .getInvoiceById(id)
      .then((res) => {
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
      const response = await invoiceService.updateInvoice(id, data);
      console.log(response.data);
      rollback();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <Loadding color={isDark ? theme.link : theme.text} size={50} />;

  return (
    <ScrollView style={styles.container}>
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
              mask="DD/MM/YYYY"
              variant="date"
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Valor da NF-e"
              name="value_nfe"
              placeholder="Digite o valor da NF-e"
              mask="money"
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
              mask="money"
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
            disabled={true}
          />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Dados de Remente/Destinatário</Text>
      </View>

      {/*Table Client*/}
      <View style={styles.contentInline}>
        {/*Remetente*/}
        <View style={styles.tableClient}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Cnpj Emitente"
              name="remetente.document"
              placeholder="Digite o CNPJ do emitente"
              mask="99.999.999/9999-99"
              errorMessage={errors.remetente?.document?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Nome Destinatário"
              name="remetente.name_client"
              placeholder="Digite o nome do destinatário"
              errorMessage={errors.remetente?.name_client?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Telefone"
              name="remetente.phone"
              placeholder="Digite o telefone"
              mask="(99) 9.9999-9999"
              errorMessage={errors.remetente?.phone?.message}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text>Endereço:</Text>
            <View>
              <ControlledInput
                control={control}
                label="Endereço"
                name="remetente.address."
                placeholder="Digite o endereço"
                errorMessage={errors.remetente?.address?.fullAddress?.message}
              />
            </View>
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
    </ScrollView>
  );
}

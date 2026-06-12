import React, { useEffect, useState } from "react";
import {
  useWindowDimensions,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
import { CollapsibleSection } from "@/components/collapsList";
import { Feather } from "@expo/vector-icons";

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
  const onInvalid = (errors: any) =>
    console.error("Erros de validação:", errors);

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
      console.log(data);
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
        <TouchableOpacity onPress={rollback}>
          <Feather
            style={styles.backButton}
            name="arrow-left"
            size={24}
            color={theme.isDark ? theme.textSecondary : "#FFF"}
          />
          <Text style={styles.headerTitle}>Editar Nota Fiscal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputWrapper}>
          <ControlledInput
            control={control}
            label="Codigo de barras"
            name="barcode"
            placeholder="Digite o codigo de barras"
            errorMessage={errors.barcode?.message}
            disabled={true}
            iconName="barcode"
          />
        </View>
        <View style={styles.contentInline}>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Número da NFe"
              name="nfe"
              placeholder="Digite o número da NFe"
              variant="numeric"
              errorMessage={errors.nfe?.message}
              iconName="folder"
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
              iconName="folder"
            />
          </View>
          <View style={styles.inputWrapper}>
            <ControlledInput
              control={control}
              label="Natureza"
              name="nature_transaction"
              placeholder="Natureza da transação"
              errorMessage={errors.nature_transaction?.message}
              iconName="folder"
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
              iconName="money-bill-1"
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
              iconName="weight-hanging"
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
              iconName="add"
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
              iconName="clipboard-list"
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
              iconName="money-bill-1"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <ControlledInput
            control={control}
            label="Observações"
            name="observation"
            placeholder=""
            errorMessage={errors.observation?.message}
            iconName="circle-info"
          />
        </View>
      </View>

      <CollapsibleSection title="Dados do Remetente">
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
                iconName="building"
              />
            </View>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Nome emitente"
                name="remetente.name_client"
                placeholder="Digite o nome do destinatário"
                errorMessage={errors.remetente?.name_client?.message}
                iconName="building-user"
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
                iconName="square-phone-flip"
              />
            </View>

            <View style={styles.header}>
              <Text style={styles.headerSubtitle}>Endereço</Text>
            </View>

            <View style={styles.addressWrapper}>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Cep"
                  name="remetente.address.zip_code"
                  placeholder="Digite o endereço"
                  mask="99999-9999"
                  errorMessage={errors.remetente?.address?.zip_code?.message}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Rua"
                  name="remetente.address.street"
                  placeholder="Digite o endereço"
                  errorMessage={errors.remetente?.address?.street?.message}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Bairro"
                  name="remetente.address.neighborhood"
                  placeholder="Digite o endereço"
                  errorMessage={
                    errors.remetente?.address?.neighborhood?.message
                  }
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Numero"
                  name="remetente.address.number"
                  placeholder="Digite o endereço"
                  errorMessage={errors.remetente?.address?.number?.message}
                />
              </View>
            </View>
            <View style={styles.addressWrapper}>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Cidade"
                  name="remetente.address.city"
                  placeholder="Digite o endereço"
                  errorMessage={errors.remetente?.address?.city?.message}
                />
              </View>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Estado"
                  name="remetente.address.state"
                  placeholder="Digite o endereço"
                  errorMessage={errors.remetente?.address?.city?.message}
                />
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Complemento"
                name="remetente.address.complement"
                placeholder="Digite o endereço"
                errorMessage={errors.remetente?.address?.city?.message}
              />
            </View>
          </View>
        </View>
      </CollapsibleSection>

      <CollapsibleSection title="Dados do Destinatário">
        <View style={styles.contentInline}>
          {/*Destinatário*/}
          <View style={styles.tableClient}>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Cnpj Destinatário"
                name="destinatario.document"
                placeholder="Digite o CNPJ do destinatário"
                mask="99.999.999/9999-99"
                errorMessage={errors.remetente?.document?.message}
                iconName="building"
              />
            </View>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Nome Destinatário"
                name="destinatario.name_client"
                placeholder="Digite o nome do destinatário"
                errorMessage={errors.destinatario?.name_client?.message}
                iconName="building-user"
              />
            </View>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Telefone"
                name="destinatario.phone"
                placeholder="Digite o telefone"
                mask="(99) 9.9999-9999"
                errorMessage={errors.destinatario?.phone?.message}
                iconName="square-phone-flip"
              />
            </View>

            <View style={styles.header}>
              <Text style={styles.headerSubtitle}>Endereço</Text>
            </View>

            <View style={styles.addressWrapper}>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Cep"
                  name="destinatario.address.zip_code"
                  placeholder="Digite o endereço"
                  mask="99999-999"
                  errorMessage={errors.destinatario?.address?.zip_code?.message}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Rua"
                  name="destinatario.address.street"
                  placeholder="Digite o endereço"
                  errorMessage={errors.destinatario?.address?.street?.message}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Bairro"
                  name="destinatario.address.neighborhood"
                  placeholder="Digite o endereço"
                  errorMessage={
                    errors.destinatario?.address?.neighborhood?.message
                  }
                />
              </View>

              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Numero"
                  name="destinatario.address.number"
                  placeholder="Digite o endereço"
                  errorMessage={errors.destinatario?.address?.number?.message}
                />
              </View>
            </View>
            <View style={styles.addressWrapper}>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Cidade"
                  name="destinatario.address.city"
                  placeholder="Digite o endereço"
                  errorMessage={errors.destinatario?.address?.city?.message}
                />
              </View>
              <View style={styles.inputWrapper}>
                <ControlledInput
                  control={control}
                  label="Estado"
                  name="destinatario.address.state"
                  placeholder="Digite o endereço"
                  errorMessage={errors.destinatario?.address?.city?.message}
                />
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <ControlledInput
                control={control}
                label="Complemento"
                name="destinatario.address.complement"
                placeholder="Digite o endereço"
                errorMessage={errors.destinatario?.address?.city?.message}
              />
            </View>
          </View>
        </View>
      </CollapsibleSection>

      <Button
        title={saving ? "Salvando..." : "Salvar Alterações"}
        onPress={handleSubmit(handleSave, onInvalid)}
        disabled={saving}
      />
    </ScrollView>
  );
}

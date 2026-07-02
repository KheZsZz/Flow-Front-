import React, { useState } from "react";
import { ScrollView, Text, Alert, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/themeContext";
import { useQueryClient } from "@tanstack/react-query";
import { ControlledInput } from "@/components/controllerInput";
import { Button } from "@/components/button";
import { createFinanceStyles } from "@/styles/finance.styles";
import {
  operationalExpenseService,
  administrativeExpenseService,
} from "@/services/expenses";
import { useExpenseTypes, listKeys } from "@/hooks/querys/useListData";
import rollback from "@/services/rollback";

interface FormData {
  expense_type_id: string;
  description: string;
  amount: string;
  department: string; // só usado se category === administrative
}

export default function CreateExpenseScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createFinanceStyles(theme, isMobile);
  const queryClient = useQueryClient();
  const { category } = useLocalSearchParams<{
    category: "operational" | "administrative";
  }>();

  const isAdministrative = category === "administrative";
  const { data: types = [] } = useExpenseTypes(
    isAdministrative ? "Administrativo" : "Operacional",
  );

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      expense_type_id: "",
      description: "",
      amount: "",
      department: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    if (!data.expense_type_id)
      return Alert.alert("Atenção", "Selecione o tipo de despesa.");
    if (!data.amount || Number(data.amount) <= 0)
      return Alert.alert("Atenção", "Informe um valor válido.");

    setSubmitting(true);
    try {
      const payload = {
        expense_type_id: data.expense_type_id,
        description: data.description || null,
        amount: Number(data.amount),
      };

      if (isAdministrative) {
        await administrativeExpenseService.create({
          ...payload,
          department: data.department || null,
        });
        queryClient.invalidateQueries({
          queryKey: listKeys.administrativeExpenses,
        });
      } else {
        await operationalExpenseService.create(payload);
        queryClient.invalidateQueries({
          queryKey: listKeys.operationalExpenses,
        });
      }

      rollback();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: isMobile ? 16 : 32, gap: 12 }}
    >
      <Text style={styles.title}>
        {isAdministrative
          ? "Novo custo administrativo"
          : "Novo custo operacional"}
      </Text>

      <ControlledInput
        control={control}
        name="expense_type_id"
        label="Tipo de despesa"
        variant="dropDownList"
        options={types.map((t: any) => ({ label: t.name, value: t.id }))}
      />

      {isAdministrative && (
        <ControlledInput
          control={control}
          name="department"
          label="Departamento (opcional)"
        />
      )}

      <ControlledInput
        control={control}
        name="amount"
        label="Valor (R$)"
        variant="numeric"
      />

      <ControlledInput
        control={control}
        name="description"
        label="Descrição (opcional)"
        multiline
      />

      <Button
        title={submitting ? "Salvando..." : "Salvar"}
        isLoading={submitting}
        onPress={handleSubmit(onSubmit)}
      />
    </ScrollView>
  );
}

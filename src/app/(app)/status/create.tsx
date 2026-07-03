import React from "react";
import { createStatus } from "@/services/status";
import {
  StatusUpdateSchema,
  StatusTypes,
} from "@/services/schemas/statusSchematusSchema";
import { useTheme } from "@/contexts/themeContext";
import {
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
} from "react-native";
import { createStatusStyles } from "@/styles/status.styles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/controllerInput";
import { Feather } from "@expo/vector-icons";
import rollback from "@/services/rollback";
import { Button } from "@/components/button";

export default function SatusCrateScreen() {
  const { theme } = useTheme();
  const isMobile = useWindowDimensions().width < 768;
  const styles = createStatusStyles(theme, isMobile);

  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<StatusTypes>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusTypes>({
    resolver: zodResolver(StatusUpdateSchema),
  });

  const onSubmit = async (data: StatusTypes) => {
    setLoading(true);
    try {
      await createStatus(data);
      reset();
    } finally {
      setLoading(false);
      rollback();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headers}>
        <TouchableOpacity style={styles.backButton} onPress={rollback}>
          <Feather name="chevron-left" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.title}>Create status</Text>
      </View>
      <View>
        <ControlledInput
          control={control}
          name="code"
          label="Código"
          placeholder="Digite o código"
          iconName="code"
          variant="numeric"
          errorMessage={errors.code?.message as string}
        />
        <ControlledInput
          control={control}
          name="name"
          label="Nome"
          placeholder="Digite o nome"
          iconName="clipboard-list"
          errorMessage={errors.name?.message as string}
        />

        <ControlledInput
          control={control}
          name="description"
          label="Descrição"
          placeholder="Digite a descrição"
          iconName="info"
          errorMessage={errors.description?.message as string}
        />

        <Button
          title={loading ? "Salvando..." : "Salvar"}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

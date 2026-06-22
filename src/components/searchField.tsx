import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ControlledInput } from "@/components/controllerInput";

interface SearchFieldProps {
  placeholder?: string;
  iconName?: any;
  onChange: (value: string) => void;
}

/**
 * Campo de busca/filtro padrão do app.
 *
 * Encapsula a convenção `useForm` + `ControlledInput` + `watch()` — assim as
 * telas de listagem param de usar `TextInput` cru e ganham, de graça, a
 * estilização e os recursos do ControlledInput (ícone, máscara, tema).
 *
 * Uso:
 *   const [search, setSearch] = useState("");
 *   <SearchField placeholder="Pesquisar..." onChange={setSearch} />
 */
export function SearchField({
  placeholder = "Pesquisar...",
  iconName = "magnifying-glass",
  onChange,
}: SearchFieldProps) {
  const { control, watch } = useForm({ defaultValues: { q: "" } });
  const q = watch("q");

  useEffect(() => {
    onChange(q ?? "");
    // só dispara quando o texto muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <ControlledInput
      control={control}
      name="q"
      placeholder={placeholder}
      iconName={iconName}
    />
  );
}

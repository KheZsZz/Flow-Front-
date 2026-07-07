import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ControlledInput } from "@/components/controllerInput";

interface SearchFieldProps {
  placeholder?: string;
  iconName?: any;
  onChange: (value: string) => void;
}

export function SearchField({
  placeholder = "Pesquisar...",
  iconName = "magnifying-glass",
  onChange,
}: SearchFieldProps) {
  const { control, watch } = useForm({ defaultValues: { q: "" } });
  const q = watch("q");

  useEffect(() => {
    onChange(q ?? "");
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

// src/app/index.tsx
import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { Loadding } from "@/components/loadding";

export default function RootIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loadding />;
  }

  return user ? (
    <Redirect href="/(app)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}

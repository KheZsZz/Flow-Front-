import React from "react";
import { View, Text, ScrollView } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{ flex: 1, padding: 24, backgroundColor: "#1a1a1a" }}
        >
          <Text style={{ color: "#f87171", fontSize: 16, fontWeight: "700" }}>
            Erro ao renderizar
          </Text>
          <Text
            style={{ color: "#fbbf24", marginTop: 12, fontFamily: "monospace" }}
          >
            {this.state.error.message}
          </Text>
          <Text style={{ color: "#aaa", marginTop: 12, fontSize: 12 }}>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

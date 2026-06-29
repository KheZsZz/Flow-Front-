import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — dados de referência mudam pouco
      gcTime: 60 * 60 * 1000, // 1h min em cache antes do garbage collect
      retry: 1,
      refetchOnWindowFocus: false, // relevante só no target web
    },
  },
});

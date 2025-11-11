import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: (failureCount, error) => {
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            (error as { status?: number }).status === 429
          ) {
            return failureCount < 5;
          }
          return failureCount < 3;
        }
      }
    }
  });
}

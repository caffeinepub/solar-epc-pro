import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't buffer forever — fail after 15s so the UI shows an error instead of spinning
      retry: 1,
      retryDelay: 2000,
      // After 30s cached data is considered stale and will re-fetch in background
      staleTime: 30_000,
      // Garbage collect unused queries after 2 minutes
      gcTime: 2 * 60 * 1000,
      // Refetch on window focus so returning to the tab picks up fresh data
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);

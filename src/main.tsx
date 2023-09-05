import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </QueryClientProvider>
  </React.StrictMode>
);

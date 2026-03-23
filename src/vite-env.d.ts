/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL: string;
  readonly VITE_LINE_API_URL: string;
  readonly VITE_SHIPPING_API_URL: string;
  readonly VITE_INVENTORY_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

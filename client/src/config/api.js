const DEFAULT_API_BASE_URL = "http://localhost:5000";

const normalizeBaseUrl = (value) => {
  if (!value) return null;
  return value.replace(/\/+$/, "");
};

export const API_BASE_URL =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_BASE_URL;

export const SOCKET_URL =
  normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL) || API_BASE_URL;

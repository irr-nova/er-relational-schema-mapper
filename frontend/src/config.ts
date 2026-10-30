// Backend base URL. Override with VITE_API_BASE in .env (e.g. the deployed API URL).
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "https://er-relational-schema-mapper-api.onrender.com";

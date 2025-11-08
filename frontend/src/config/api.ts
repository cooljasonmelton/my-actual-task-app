const DEFAULT_API_BASE_URL = "http://localhost:3000";
const CAT_API_BASE_URL = "https://api.thecatapi.com/v1";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

const buildUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const TASKS_API_URL = buildUrl("/tasks");
export const NOTES_API_URL = buildUrl("/notes");

export const CAT_IMAGES_URL = `${CAT_API_BASE_URL}/images/search`;
export const CAT_API_KEY = import.meta.env.VITE_CAT_API_KEY?.trim();

export { API_BASE_URL };

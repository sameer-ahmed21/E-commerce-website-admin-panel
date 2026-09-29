// Central place for the backend base URL. Set VITE_API_URL in a .env file to
// override. Defaults to the local dev server while running `vite dev`, and to
// the deployed ecommerce-website backend in a production build.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ecommerce-website-backend-two.vercel.app');

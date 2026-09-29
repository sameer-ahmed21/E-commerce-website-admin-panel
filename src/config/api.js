// Central place for the backend base URL. Set VITE_API_URL in a .env file to
// override. Defaults to the local dev server while running `vite dev`, and to
// the deployed ecommerce-website backend in a production build.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ecommerce-website-backend-smoky.vercel.app');

// Seeded products store their image as a path like "/products/arrival 1.png",
// which only exists inside the storefront's own public/ folder — this app has
// no such assets, so those paths need resolving against the storefront's origin.
const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'https://ecommerce-website-two-plum.vercel.app';

export function resolveImageUrl(image) {
  if (!image) return image;
  return image.startsWith('/') ? `${STOREFRONT_URL}${image}` : image;
}

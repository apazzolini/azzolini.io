/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />

declare global {
  type Maybe<T> = T | null | undefined;
}

declare module 'react-router' {
  interface RouteObject {
    meta: Record<string, any>;
  }
}

// Necessary for TS to treat this file as a module instead of a script
export default {};

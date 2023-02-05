import '../.astro/types.d';
/// <reference types="astro/client" />

declare global {
  type Maybe<T> = T | null | undefined;
}

// Necessary for TS to treat this file as a module instead of a script
export default {};

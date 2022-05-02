/**
 * Throws an error if the object's value is nullish
 * @param obj The object
 * @param errorMessage If provided, overrides the default error message
 */
export function assertNotNullish<T>(obj: T, errorMessage?: string): asserts obj is NonNullable<T> {
  if (obj == null) {
    throw new Error(errorMessage ?? 'Object was nullish');
  }
}

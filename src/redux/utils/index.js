export function fromError(error) {
  return {
    msg: error.toString()
  };
}

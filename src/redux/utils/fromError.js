export default function fromError(error) {
  return {
    msg: error.toString()
  };
}

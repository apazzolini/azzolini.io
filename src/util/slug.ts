const memo: Record<string, string> = {};

export default function slug(title: string) {
  return (() => {
    if (!memo[title]) {
      memo[title] = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }
    return memo[title];
  })();
}

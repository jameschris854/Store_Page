export function buildPexelsImage(url: string) {
  const base = `${url}?auto=compress&cs=tinysrgb`;
  return {
    base,
    small: `${base}&h=300`,
    medium: `${base}&h=600`,
    large: `${base}&h=900`,
  };
}

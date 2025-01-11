const excerptLength = 120;

export function getExcerpt(excerpt: string | undefined) {
  let _excerpt = excerpt;
  if (excerpt && excerpt.length > excerptLength) {
    _excerpt = excerpt.slice(0, excerptLength) + "...";
  }
  return _excerpt;
}

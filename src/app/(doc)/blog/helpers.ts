export function getExcerpt(excerpt: string | undefined) {
  let _excerpt = excerpt;
  if (excerpt && excerpt.length > 100) {
    _excerpt = excerpt.slice(0, 100) + "...";
  }
  return _excerpt;
}

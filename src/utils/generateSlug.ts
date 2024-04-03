export function generateSlug(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

  console.log(slug);

  return slug;
}

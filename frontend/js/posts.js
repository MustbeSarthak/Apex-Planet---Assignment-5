function postImage(post) {
  return post.coverImage || "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=900&h=500&fit=crop";
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
}

function readingTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

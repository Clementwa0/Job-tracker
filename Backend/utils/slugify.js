function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function buildJobSlug(title, companyName, location, suffix = "") {
  const parts = [title, companyName, location].map(slugify).filter(Boolean);
  const base = parts.join("-") || "job";
  return suffix ? `${base}-${suffix}` : base;
}

module.exports = { slugify, buildJobSlug };

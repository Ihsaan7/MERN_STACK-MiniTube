// Returns a human-readable relative time string (e.g., '2 minutes ago')
export function timeAgo(date) {
  if (!date) return "just now";
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000); // seconds

  if (diff < 60) return "just now";
  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${
      Math.floor(diff / 60) === 1 ? "" : "s"
    } ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${
      Math.floor(diff / 3600) === 1 ? "" : "s"
    } ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 86400)} day${
      Math.floor(diff / 86400) === 1 ? "" : "s"
    } ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${
      Math.floor(diff / 2592000) === 1 ? "" : "s"
    } ago`;
  return `${Math.floor(diff / 31536000)} year${
    Math.floor(diff / 31536000) === 1 ? "" : "s"
  } ago`;
}

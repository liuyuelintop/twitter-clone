export const deletePostRequest = async (postId) => {
  const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const likePostRequest = async (postId) => {
  const res = await fetch(`/api/posts/like/${postId}`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const commentPostRequest = async (postId, comment) => {
  const res = await fetch(`/api/posts/comment/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const bookmarkPostRequest = async (postId) => {
  const res = await fetch(`/api/posts/bookmark/${postId}`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

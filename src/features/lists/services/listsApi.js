import api from "@/lib/api";

const listsApi = {
  getAll: () =>
    api.get("/lists"),

  getOne: (id) =>
    api.get(`/lists/${id}`),

  create: (title, description) =>
    api.post("/lists", { title, description }),

  update: (id, fields) =>
    api.patch(`/lists/${id}`, fields),

  destroy: (id) =>
    api.delete(`/lists/${id}`),

  share: (id) =>
    api.post(`/lists/${id}/share`),

  revokeShare: (id) =>
    api.delete(`/lists/${id}/share`),

  getShared: (token) =>
    api.get(`/lists/shared/${token}`),

  addItem: (listId, itemData) =>
    api.post(`/lists/${listId}/items`, itemData),

  removeItem: (listId, itemId) =>
    api.delete(`/lists/${listId}/items/${itemId}`),
};

export default listsApi;
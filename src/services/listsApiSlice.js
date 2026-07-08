import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/lib/axiosBaseQuery";

// NOTE: axiosBaseQuery destructures { url, method, data, params } (axios convention),
// so request bodies are passed as `data`, not `body`. The api.js interceptor already
// unwraps response.data.data, so each endpoint's `data` payload is the raw server body
// (e.g. { lists }, { list }, { item }).
export const listsApi = createApi({
  reducerPath: "listsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Lists", "ListDetail"],
  endpoints: (build) => ({
    getLists: build.query({
      query: () => ({ url: "/lists", method: "GET" }),
      providesTags: ["Lists"],
    }),

    getListDetail: build.query({
      query: (id) => ({ url: `/lists/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "ListDetail", id }],
    }),

    createList: build.mutation({
      query: ({ title, description }) => ({
        url: "/lists",
        method: "POST",
        data: { title, description },
      }),
      invalidatesTags: ["Lists"],
      // Surface the same LIMIT_EXCEEDED error shape components already handle.
      transformErrorResponse: (error) => {
        if (
          error?.status === 403 ||
          error?.message?.toLowerCase?.().includes("limit")
        ) {
          return { ...error, code: "LIMIT_EXCEEDED", message: "List limit reached" };
        }
        return error;
      },
    }),

    deleteList: build.mutation({
      query: (id) => ({ url: `/lists/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lists"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          listsApi.util.updateQueryData("getLists", undefined, (draft) => {
            if (draft?.lists) {
              draft.lists = draft.lists.filter((l) => l.id !== id);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    updateListMeta: build.mutation({
      // Only the provided fields are sent, preserving partial-patch behaviour.
      query: ({ id, ...patch }) => ({
        url: `/lists/${id}`,
        method: "PATCH",
        data: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ListDetail", id },
        "Lists",
      ],
    }),

    addItem: build.mutation({
      query: ({ listId, ...body }) => ({
        url: `/lists/${listId}/items`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: "ListDetail", id: listId },
        "Lists",
      ],
      async onQueryStarted(
        { listId, podcast_name, artwork_url },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          listsApi.util.updateQueryData("getLists", undefined, (draft) => {
            const list = draft?.lists?.find((l) => l.id === listId);
            if (list) {
              list.item_count = (list.item_count || 0) + 1;
              const newItem = {
                artwork_url: artwork_url ?? null,
                podcast_name,
              };
              list.items = [newItem, ...(list.items || [])].slice(0, 4);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeItem: build.mutation({
      // No invalidation — pure optimistic update with a deferred commit. The
      // network call only fires when the component triggers this mutation.
      query: ({ listId, itemId }) => ({
        url: `/lists/${listId}/items/${itemId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ listId, itemId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          listsApi.util.updateQueryData("getListDetail", listId, (draft) => {
            if (draft?.list?.items) {
              draft.list.items = draft.list.items.filter((i) => i.id !== itemId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // Endpoint key must be "shareList" (not "share") — RTK Query generates hook
    // names as use<PascalCase(endpointKey)>Mutation, so "share" would produce
    // useShareMutation, not the useShareListMutation that ListHeader.jsx imports.
    shareList: build.mutation({
      query: (id) => ({ url: `/lists/${id}/share`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: "ListDetail", id }, "Lists"],
    }),

    revokeShare: build.mutation({
      query: (id) => ({ url: `/lists/${id}/share`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "ListDetail", id }, "Lists"],
    }),

    emailExport: build.mutation({
      query: ({ id, format, recipient, email }) => ({
        url: `/lists/${id}/email`,
        method: "POST",
        data: { format, recipient, email },
      }),
    }),
  }),
});

export const {
  useGetListsQuery,
  useGetListDetailQuery,
  useCreateListMutation,
  useDeleteListMutation,
  useUpdateListMetaMutation,
  useAddItemMutation,
  useRemoveItemMutation,
  useShareListMutation,
  useRevokeShareMutation,
  useEmailExportMutation,
} = listsApi;

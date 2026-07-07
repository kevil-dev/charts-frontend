import api from "@/lib/api";

export const podcastMetaApi = {
  get: (matchKey) =>
    api.get("/podcasts/meta", { params: { match_key: matchKey } }).then((res) => res.meta),
};

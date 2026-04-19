import { onRequestPost as __api_amazon_search_ts_onRequestPost } from "/Users/ryota/link_builder/functions/api/amazon-search.ts"

export const routes = [
    {
      routePath: "/api/amazon-search",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_amazon_search_ts_onRequestPost],
    },
  ]
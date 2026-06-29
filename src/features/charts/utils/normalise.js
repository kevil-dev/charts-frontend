export function normaliseCountries(apiList) {
  return apiList.map((c) => ({
    code: (c.country_code ?? c.code ?? "").toLowerCase(),
    name: c.display_name ?? c.name ?? "",
    flag: c.flag ?? "",
  }));
}

export function normaliseCategories(apiList) {
  return apiList.map((g) => ({
    slug: g.native_id ?? g.slug ?? "",
    label: g.display_name ?? g.label ?? g.native_id ?? "",
  }));
}
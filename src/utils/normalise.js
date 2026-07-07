export function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function normaliseCountries(apiList) {
  return apiList.map((c) => {
    const code = (c.country_code ?? c.code ?? "").toLowerCase();
    return {
      code,
      name: c.display_name ?? c.name ?? "",
      flag: c.flag || getFlagEmoji(code),
    };
  });
}

export function normaliseCategories(apiList) {
  return apiList.map((g) => ({
    slug: g.native_id ?? g.slug ?? "",
    label: g.display_name ?? g.label ?? g.native_id ?? "",
  }));
}
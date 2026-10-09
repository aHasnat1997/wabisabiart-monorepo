import countries from "world-countries";
import getSymbolFromCurrency from "currency-symbol-map";

export const regionOptions = countries
  .map((c) => {
    const currencyCode = Object.keys(c.currencies || {})[0];

    return {
      value: c.cca2,
      label: c.name.common,
      currency: currencyCode,
      flag: c.flag,
    };
  })
  .filter((c) => c.currency)
  .sort((a, b) => a.label.localeCompare(b.label));

export const currencyOptions = Array.from(
  new Set(regionOptions.map((c) => c.currency)),
).map((code) => ({
  code,
  symbol: getSymbolFromCurrency(code) || "",
}));

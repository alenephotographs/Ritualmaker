export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function farmLabel(farm: string): string {
  if (farm === "ritualmaker") return "Ritualmaker Farm";
  if (farm === "wonderland-ridge") return "Wonderland Ridge Farm";
  return farm;
}

export function sizeLabel(s: string): string {
  if (s === "large") return "Large";
  if (s === "small") return "Small";
  return s;
}

export function categoryLabel(c: string): string {
  const map: Record<string, string> = {
    oil: "Oil",
    salt: "Salt",
    sugar: "Sugar",
    eggs: "Eggs",
    other: "",
  };
  return map[c] ?? c;
}

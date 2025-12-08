export const ItemShopDetailsPrompt = (value: string) => {
  return `
You will receive a single JSON object describing a Fortnite Item Shop item. Produce a concise, accurate natural-language summary (one sentence or a short paragraph, no HTML or markup). Include only relevant information: item type (display_type), name, granted item name and rarity (if different from display name), price (show normal and final price and indicate if on sale), availability (start — end in ISO 8601 or human-friendly dates), series if present, section name, supported game modes, and any notable special_offer text if present. If a field is null or missing, omit it from the summary. Use natural phrasing and correct capitalization. Examples of phrasing:
- If on offer: "normally X, now Y (on offer)"
- If special_offer is not N/A, append: "Special offer: <special_offer>."
- Use a neutral, matter-of-fact tone.
- Make it into sentence

Now summarize this JSON object exactly:
${value}
`;
};

export const ItemShopPrompt = (value: string) => {};

export const TournamentDetailsPrompt = (value: string) => {
  return ``;
};

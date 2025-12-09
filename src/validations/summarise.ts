import { z } from 'zod';

const ShopDetailGranted = z.object({
  display_type: z.string(),
  name: z.string(),
  rarity: z.string(),
});

export const ShopDetailSummaryValidationSchema = z.object({
  special_offer: z.string().nullable(),
  name: z.string(),
  display_type: z.string(),
  available_from: z.date(),
  available_until: z.date(),
  normal_price: z.number(),
  final_price: z.number(),
  series: z.string().nullable(),
  section_name: z.string(),
  supported_modes: z.string().array(),
  granted: z.array(ShopDetailGranted).default([]),
});

export const ShopSummaryValidationSchema = z.array(ShopDetailSummaryValidationSchema);

export const TournamentDetailsSummaryValidationSchema = z.object({
  name: z.string(),
  minimum_account_level: z.number(),
  details_description: z.string(),
  start_time: z.date(),
  end_time: z.date(),
  platforms: z.string(),
  total_sessions: z.number(),
});

export const CosmeticDetailSummaryValidationSchema = z.object({
  name: z.string(),
  description: z.string(),
  item_type: z.string(),
  reactive: z.boolean(),
  built_in_emote: z.boolean(),
  battle_pass: z.string().nullable(),
  series: z.string().nullable(),
  set: z.string().nullable(),
  season_introduced: z.string().nullable(),
  shop_history_count: z.number(),
  last_show_appearance: z.string(),
  styles_count: z.number(),
  styles_by_mode: z.string(),
});

export interface IRootEpicGamesTournament {
  scoringRuleSets: { [id: string]: IRootScoringRuleSet[] };
  payoutTables: { [id: string]: IRootPayoutTable[] };
  events: IRootEvent[];
  templates: IRootTemplate[];
  leaderboardDefs: IRootLeaderboardDefs[];
  scoreLocationScoringRuleSets: { [idKey: string]: string };
  scoreLocationPayoutTables: { [idKey: string]: string };
  resolvedWindowLocations: { [idKey: string]: string[] };
  eventSeries: any;
}

// Start Scoring Rule Set Interface
export interface IRootScoringRuleSet {
  trackedStat: string;
  matchRule: string;
  rewardTiers: IScoringRuleSetRewardTier[];
}

interface IScoringRuleSetRewardTier {
  keyValue: number;
  pointsEarned: number;
  multiplicative: boolean;
}
// End Scoring Rule Set Interface

// Start Payout Table Interface
export interface IRootPayoutTable {
  scoringType: string;
  ranks: IPayoutTableRank[];
}

interface IPayoutTableRank {
  threshold: number;
  payouts: IPayoutTableRankPayout[];
}

interface IPayoutTableRankPayout {
  rewardType: string;
  rewardMode: string;
  value: string;
  quantity: number;
  notifiesPlayer: boolean;
}
// End Payout Table Interface

// Start Event Interface
interface IRootEvent {
  gameId: string;
  eventId: string;
  beginTime: string;
  endTime: string;
  displayDataId: string;
  eventGroup: string;
  announcementTime: string;
  regions: string[];
  regionMappings: { [region: string]: string };
  platforms: string[];
  platformMappings: any;
  metadata: IMetadata;
  eventWindows: IEventWindow[];
  link: IEventLink;
}

interface IEventLink {
  type: string;
  code: string;
}

interface IEventWindow {
  eventWindowId: string;
  eventTemplateId: string;
  countdownBeginTime: string;
  beginTime: string;
  endTime: string;
  round: number;
  payoutDelay: number;
  isTBD: boolean;
  visibility: string;
  additionalRequirements: string[];
  teammateEligibility: string;
  blackoutPeriods: any[];
  scoreLocations: IScoreLocation[];
  canLiveSpectate: boolean;
  requireAllTokens: string[];
  requireAnyTokens: string[];
  requireNoneTokensCaller: string[];
  requireAllTokensCaller: any[];
  requireAnyTokensCaller: any[];
  regionMappings: any;
  metadata: IEventWindowMetadata;
}

interface IEventWindowMetadata {
  ServerReplays: boolean;
  RoundType: string;
  ScheduledMatchmakingInitialDelaySeconds?: number;
  ScheduledMatchmakingMatchDelaySeconds?: number;
}

interface IScoreLocation {
  leaderboardDefId: string;
  isMainWindowLeaderboard: boolean;
}

interface IMetadata {
  requireSystemFeatures: string[];
  tournamentType: string;
  TeamLockType: string;
  webId: string;
  minimumAccountLevel: number;
  DisqualifyType: string;
  AccountLockType: string;
}
// End Event Interface

// Start Template Interface
interface IRootTemplate {
  playlistId: string;
  matchCap: number;
  tiebreakerFormula: ITieBreakerFormula;
  gameId: string;
  eventTemplateId: string;
  scoringRules: any[];
  payoutTable: any[];
  liveSessionAttributes: any[];
  clampsToZero: boolean;
}

interface ITieBreakerFormula {
  basePointsBits: number;
  components: ITieBreakerFormulaComponent[];
}

interface ITieBreakerFormulaComponent {
  trackedStat: string;
  bits: number;
  aggregation: string;
  multiplier?: number;
}
// End Template Interface

// Start Leaderboard Defs Interface
export interface IRootLeaderboardDefs {
  gameId: string;
  leaderboardDefId: string;
  leaderboardStorageId: string;
  leaderboardInstanceGroupingKeyFormat: string;
  leaderboardInstanceIdFormat: string;
  maxSessionHistorySize: number;
  useIndividualScores: boolean;
  tiebreakerFormula: ITieBreakerFormula;
  scoringRuleSetId: string;
  clampsToZero: boolean;
  payoutsConfig?: ILeaderboardDefsPayoutConfig;
  percentileAccuracy?: number;
  onlyScoreTopN: number;
  hidePlayerScores: boolean;
  requiredPlayerListings: any[];
}

interface ILeaderboardDefsPayoutConfig {
  payoutTableIdFormat: string;
  payoutDate: string;
}
// End Leaderboard Defs Interface

// Start of Epic Games Tournament Details Endpoint
export interface IRootEpicGamesTournamentDetail {
  conversion_config: ITDConversionConfig;
  tournament_info: { _type: string };
  _title: string;
  _noIndex: boolean;
  _activeDate: string;
  lastModified: string;
  _locale: string;
  _templateName: string;
  _suggestedPrefetch: any[];
}

export interface ITDConversionConfig {
  containerName: string;
  _type: string;
  enableReferences: boolean;
  contentName: string;
}

export interface ITDObj {
  tournament_info: ITournamentInfo;
  _title: string;
  _noIndex: boolean;
  _activeDate: string;
  lastModified: string;
  _locale: string;
  _templateName: string;
}

interface ITournamentInfo {
  title_color: string;
  loading_screen_image: string;
  background_text_color: string;
  background_right_color: string;
  poster_back_image: string;
  pin_earned_text: string;
  _type: string;
  tournament_display_id: string;
  highlight_color: string;
  schedule_info: string;
  primary_color: string;
  flavor_description: string;
  poster_front_image: string;
  short_format_title: string;
  title_line_2: string;
  title_line_1: string;
  shadow_color: string;
  details_description: string;
  background_left_color: string;
  long_format_title: string;
  poster_fade_color: string;
  secondary_color: string;
  playlist_tile_image: string;
  base_color: string;
}

export interface ITournamentDisplayInfo {
  displayId: string;
  title_line_1?: string;
  title_line_2?: string;
  short_format_title?: string;
  details_description?: string;
  playlist_tile_image?: string;
}
// End of Epic Games Tournament Details Endpoint

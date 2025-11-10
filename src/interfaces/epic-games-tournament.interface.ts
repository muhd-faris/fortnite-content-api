export interface IRootEpicGamesTournament {
    scoringRuleSets: { [id: string]: IRootScoringRuleSet[]; };
    payoutTables: { [id: string]: IRootPayoutTable[]; };
    events: IRootEvent[];
    templates: IRootTemplate[];
    leaderboardDefs: IRootLeaderboardDefs[];
    scoreLocationScoringRuleSets: { [idKey: string]: string; };
    scoreLocationPayoutTables: { [idKey: string]: string; };
    resolvedWindowLocations: { [idKey: string]: string[]; };
    eventSeries: any;
};

// Start Scoring Rule Set Interface
interface IRootScoringRuleSet {
    trackedStat: string;
    matchRule: string;
    rewardTiers: IScoringRuleSetRewardTier[];
};

interface IScoringRuleSetRewardTier {
    keyValue: number;
    pointsEarned: number;
    multiplicative: boolean;
};
// End Scoring Rule Set Interface

// Start Payout Table Interface
interface IRootPayoutTable {
    scoringType: string;
    ranks: IPayoutTableRank[];
};

interface IPayoutTableRank {
    threshold: number;
    payouts: IPayoutTableRankPayout[];
};

interface IPayoutTableRankPayout {
    rewardType: string;
    rewardMode: string;
    value: string;
    quantity: number;
    notifiesPlayer: boolean;
};
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
  metadata: Metadata;
  eventWindows: IEventWindow[];
  link: IEventLink;
};

interface IEventLink {
  type: string;
  code: string;
};

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
  scoreLocations: ScoreLocation[];
  canLiveSpectate: boolean;
  requireAllTokens: string[];
  requireAnyTokens: string[];
  requireNoneTokensCaller: string[];
  requireAllTokensCaller: any[];
  requireAnyTokensCaller: any[];
  regionMappings: any;
  metadata: IEventWindowMetadata;
};

interface IEventWindowMetadata {
  ServerReplays: boolean;
  RoundType: string;
  ScheduledMatchmakingInitialDelaySeconds?: number;
  ScheduledMatchmakingMatchDelaySeconds?: number;
};

interface ScoreLocation {
  leaderboardDefId: string;
  isMainWindowLeaderboard: boolean;
};

interface Metadata {
  requireSystemFeatures: string[];
  tournamentType: string;
  TeamLockType: string;
  webId: string;
  minimumAccountLevel: number;
  DisqualifyType: string;
  AccountLockType: string;
};
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
};

interface ITieBreakerFormula {
  basePointsBits: number;
  components: ITieBreakerFormulaComponent[];
};

interface ITieBreakerFormulaComponent {
  trackedStat: string;
  bits: number;
  aggregation: string;
  multiplier?: number;
};
// End Template Interface

// Start Leaderboard Defs Interface
interface IRootLeaderboardDefs {
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
  onlyScoreTopN: number;
  hidePlayerScores: boolean;
  requiredPlayerListings: any[];
};
// End Leaderboard Defs Interface
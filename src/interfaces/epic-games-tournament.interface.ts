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
export interface IRootScoringRuleSet {
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
export interface IRootPayoutTable {
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
  metadata: IMetadata;
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
  scoreLocations: IScoreLocation[];
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

interface IScoreLocation {
  leaderboardDefId: string;
  isMainWindowLeaderboard: boolean;
};

interface IMetadata {
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
};

interface ILeaderboardDefsPayoutConfig {
  payoutTableIdFormat: string;
  payoutDate: string;
};
// End Leaderboard Defs Interface

// TODO: Fix interface
export interface IRootEpicGamesTournamentDetail {
  conversion_config: Conversionconfig;
  tournament_info: Tournamentinfo;
  _title: string;
  _noIndex: boolean;
  _activeDate: string;
  lastModified: string;
  _locale: string;
  _templateName: string;
  s12FncsWeek2Large: S12FncsWeek2Large;
  s12FncsWeek1Large: S12FncsWeek1Large;
  s12FncsWeek3Large: S12FncsWeek2Large;
  s12FncsWeek4Large: S12FncsWeek2Large;
  limitedTestEventSolo: LimitedTestEventSolo;
  bettotestAqua: BettotestAqua;
  s33RankedcupBsSolo: S33RankedcupBsSolo;
  s33RankedcupBsgDuos: S33RankedcupBsSolo;
  s33Division2: S33Division2;
  s33Major1Finals: S33Major1Finals;
  s33Major1Playin: S33Major1Finals;
  s33Perfeval: S33Perfeval;
  s33RankedcupEliteSolo: S33RankedcupEliteSolo;
  s33Playstation: S12FncsWeek2Large;
  s33RankedcupEliteDuos: S33RankedcupEliteSolo;
  s33RankedcupBsgSolo: S33RankedcupEliteSolo;
  s33RankedcupPdDuos: S33RankedcupEliteSolo;
  s33RankedcupPdSolo: S33RankedcupEliteSolo;
  s33Solocash: S33Solocash;
  s33Division1: S33Division2;
  s33Division3: S33Division2;
  s33FncsTrial: S33Solocash;
  s33Major1Group: S33Major1Finals;
  s33Major1Lcq: S33Major1Finals;
  bettotestAquaMe: S12FncsWeek2Large;
  bettotestAquaBrme: S12FncsWeek2Large;
  bettotestAquaBr: S12FncsWeek2Large;
  testingCup: TestingCup;
  theTestingCupCup: TheTestingCupCup;
  testCup: TestCup;
  theTestingTestOfTestersCup: TheTestingCupCup;
  theCupOfTestingAllOfTestCups: TheTestingCupCup;
  testingTheTestCupForTestingReasons: TheTestingCupCup;
  testTestingCup: TestTestingCup;
  theTestingTestCupCup: TestTestingCup;
  theTestingTestTesterInNeedOfTesting: TheTestingCupCup;
  s33OgCup: S33Solocash;
  s33OgCupzb: S33Solocash;
  s25VictorycashSolobrCopy: S25VictorycashSolobrCopy;
  s33Ogcommunitycup: S33Ogcommunitycup;
  s33OgcommunitycupZb: S33Ogcommunitycup;
  s33Fncscommunity: S33Ogcommunitycup;
  s33Division1Copy: S33Division1Copy;
  s33Division2Copy: S33Division1Copy;
  s33Division3Copy: S33Division3Copy;
  s33FncsTrialCopy: S33FncsTrialCopy;
  s33FncscommunityCopy: S33FncscommunityCopy;
  s33Major1FinalsCopy: S33Major1FinalsCopy;
  s33Major1GroupCopy: S33Major1FinalsCopy;
  s33Major1LcqCopy: S33Major1FinalsCopy;
  s33Major1PlayinCopy: S33Major1FinalsCopy;
  s33OgCupCopy: S33FncsTrialCopy;
  s33OgCupzbCopy: S33FncsTrialCopy;
  s33OgcommunitycupCopy: S33FncscommunityCopy;
  s33OgcommunitycupZbCopy: S33FncscommunityCopy;
  s33PerfevalCopy: S33PerfevalCopy;
  s33PlaystationCopy: S25VictorycashSolobrCopy;
  s33RankedcupBsSoloCopy: S33RankedcupBsSolo;
  s33RankedcupBsgDuosCopy: S33RankedcupBsSolo;
  s33RankedcupBsgSoloCopy: S33RankedcupBsSolo;
  s33RankedcupEliteDuosCopy: S33RankedcupBsSolo;
  s33RankedcupEliteSoloCopy: S33RankedcupBsSolo;
  s33RankedcupPdDuosCopy: S33RankedcupBsSolo;
  s33RankedcupPdSoloCopy: S33RankedcupBsSolo;
  s33SolocashCopy: S33FncsTrialCopy;
  s34Division2: S34Division2;
  s34Major2Finals: S33Major1Finals;
  s34Major2Lcq: S33Major1Finals;
  s34Major2Playin: S33Major1Finals;
  s34OgCup: S34OgCup;
  s34RankedcupBsgDuos: S34RankedcupBsgDuos;
  s34RankedcupEliteSolo: S34RankedcupBsgDuos;
  s34RankedcupPdSolo: S34RankedcupBsgDuos;
  s34OgCupzb: S34OgCup;
  s34Perfeval: S34Perfeval;
  s34RankedcupBsgSolo: S34RankedcupBsgDuos;
  s34RankedcupPdDuos: S34RankedcupBsgDuos;
  s34Solocash: S34OgCup;
  s34Division1: S34Division2;
  s34Division3: S34Division3;
  s34Major2Group: S33Major1Finals;
  s34RankedcupEliteDuos: S34RankedcupBsgDuos;
  s34Reloadopen: S34Reloadopen;
  s34Lantern: S34Lantern;
  s34Playstation: S34Playstation;
  s34Ohtani: S34Reloadopen;
  s34PerfevalReload: S34Perfeval;
  s34Clix: S34Reloadopen;
  s34Fncscommunity: S34Fncscommunity;
  s34Zadiereload: S34Reloadopen;
  s34Thunderbolts: S34Reloadopen;
  s35Proam2025: S35Proam2025;
  s35FncsClix: S34Fncscommunity;
  s35FncsBugha: S34Fncscommunity;
  s35FncsLachlan: S34Fncscommunity;
  s35FncsLoserfruit: S34Fncscommunity;
  s35Fncsshowdown: S35Proam2025;
  s35RankedSoloPd: S35RankedSoloPd;
  s35RankedDuosPd: S35RankedSoloPd;
  s35RankedDuosreloadPd: S35RankedSoloPd;
  s35RankedTriosPd: S35RankedSoloPd;
  s35ZadierankedTrios: S35RankedSoloPd;
  s35ZadierankedDuosreload: S35RankedSoloPd;
  s35RankedSoloBsg: S35RankedSoloBsg;
  s35RankedDuosreloadBsg: S35RankedSoloBsg;
  s35RankedTriosBsg: S35RankedSoloBsg;
  s35ZadierankedDuos: S35RankedSoloPd;
  s35ZadierankedSolo: S35RankedSoloPd;
  s35Duosconsole: S34Reloadopen;
  s35RankedDuosBsg: S35RankedSoloBsg;
  stage02025Br: Stage02025Br;
  stage02025Zb: Stage02025Br;
  s36Division2: S34Division2;
  s36Duosconsole: S34Reloadopen;
  s36Major3Group: S33Major1Finals;
  s36RankedDuosreload: S35RankedSoloBsg;
  s36RankedTriosbr: S35RankedSoloBsg;
  s36Playstation: S34Playstation;
  s36Division3: S34Division3;
  s36Major3Finals: S33Major1Finals;
  s36Major3Lcq: S33Major1Finals;
  s36Major3Playin: S33Major1Finals;
  s36RankedSolobr: S35RankedSoloBsg;
  s36Division1: S34Division2;
  s36Squidgrounds: S36Squidgrounds;
  s10FncsWeek1LargeCopy: S12FncsWeek1Large;
  s36Squidcash: S36Squidgrounds;
  s36Fncscommunity: S36Fncscommunity;
  s36Fantasticfour: S36Squidgrounds;
  s37Gc2025: S37Gc2025;
  s37Redranger: S36Fncscommunity;
  s37Pinkranger: S36Fncscommunity;
  s37Bladeofchamps: S36Fncscommunity;
  s37Division1: S37Division1;
  s37Duosconsole: S34Reloadopen;
  s37Aceswild: S36Fncscommunity;
  s37Axeofchampions: S36Fncscommunity;
  s37Crystal: S36Fncscommunity;
  s37Division2: S37Division1;
  s37Division3: S37Division3;
  s37RankedDuosbr: S35RankedSoloBsg;
  s37Reloadquick: S36Fncscommunity;
  s37Pj: S36Fncscommunity;
  s37Playstation: S37Playstation;
  s37RankedDuosreload: S35RankedSoloBsg;
  s37RankedSolobr: S35RankedSoloBsg;
  s37Surfwitch: S36Fncscommunity;
  s37FncsLoserfruit: S36Fncscommunity;
  s37Elitezadie: S36Fncscommunity;
  s37FncsBugha: S36Fncscommunity;
  s37FncsClix: S36Fncscommunity;
  s37FncsLachlan: S36Fncscommunity;
  s37Soloseries: S37Soloseries;
  s37Duostrial: S37Duostrial;
  s37Division1Duos: S37Division1;
  s37Division2Duos: S37Division1;
  s37Division3Duos: S37Division1;
  s37Division4Duos: S37Division1;
  s37Division5Duos: S37Division1;
  s37Blitzmobile: S36Fncscommunity;
  s37Blitztest: S36Fncscommunity;
  s37Blitzweekly: S36Fncscommunity;
  s37AxeofchampionsBlitz: S37AxeofchampionsBlitz;
  s37SurfwitchFncsBlitz: S37AxeofchampionsBlitz;
  s37Blitzoneswing: S36Fncscommunity;
  s37Perfeval: S37Perfeval;
  s37Kaicenat: S37AxeofchampionsBlitz;
  s37Delulu: S37Delulu;
  s37Mrsavage: S37Mrsavage;
  s37Earlyaccesscups: S37AxeofchampionsBlitz;
  s37Nitemareisland: S37AxeofchampionsBlitz;
  s37Fortnitefridays: S37AxeofchampionsBlitz;
  s37Jason: S37AxeofchampionsBlitz;
  s37Wednesday: S37AxeofchampionsBlitz;
  s37FortnitefridaysDelulu: S37AxeofchampionsBlitz;
  s29Riseofmidas: S34Perfeval;
  s38Soloseries: S37Soloseries;
  s38OgCup: S34OgCup;
  s38OgCupzb: S34OgCup;
  s38Playstationreload: S37Playstation;
  s38Perfeval: S37Perfeval;
  s38RankedDuosreload: S35RankedSoloBsg;
  s38Reloadquick: S36Fncscommunity;
  s38Duosvictory: S37AxeofchampionsBlitz;
  s38Squadsvictory: S37AxeofchampionsBlitz;
  s38RankedDuosbr: S35RankedSoloBsg;
  s38RankedDuoszb: S35RankedSoloBsg;
  s38RankedSolobr: S35RankedSoloBsg;
  s38Touchonly: S37AxeofchampionsBlitz;
  s38Blitzmobile: S36Fncscommunity;
  _suggestedPrefetch: any[];
};

export interface Tournamentinfo {
  _type: string;
};

export interface Conversionconfig {
  containerName: string;
  _type: string;
  enableReferences: boolean;
  contentName: string;
};
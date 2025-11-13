import { IRootEpicGamesTournamentDetail, ITDObj } from '../interfaces';

export type TTournamentExtraDetails = IRootEpicGamesTournamentDetail & {
  [key: string]: ITDObj;
};

export interface IRootAccountLookup {
  id: string;
  displayName: string;
  // TODO: Define interface type
  links: any;
  externalAuths: Record<string, IExternalAuth>;
}

interface IExternalAuth {
  accountId: string;
  type: string;
  externalAuthId: string;
  externalAuthIdType: string;
  externalDisplayName: string;
  authIds: IAuthId[];
}

interface IAuthId {
  id: string;
  type: string;
}

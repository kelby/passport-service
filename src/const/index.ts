export * from './network';

export const enumKeys = (es: any) => Object.values(es).filter((x) => typeof x === 'string');
export const UNIT_WEI = 1e18;

export enum ProposalStatus {
  Inactive = 0,
  Active = 1,
  Passed = 2,
  Executed = 3,
  Cancelled = 4,
}

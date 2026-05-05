export type StoreScope = "session";

export type OwnershipType =
  | "server-query"
  | "shared-client-store"
  | "local-component";

export type StateOwnershipRule = {
  stateConcern: string;
  ownerType: OwnershipType;
  conflictPolicy: "server-wins";
  userNoticeRequired: boolean;
};

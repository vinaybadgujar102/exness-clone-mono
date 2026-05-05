import type { StateOwnershipRule } from "@/stores/types";

export const stateOwnershipMap: StateOwnershipRule[] = [
  {
    stateConcern: "open-positions",
    ownerType: "server-query",
    conflictPolicy: "server-wins",
    userNoticeRequired: true,
  },
  {
    stateConcern: "account-balance",
    ownerType: "server-query",
    conflictPolicy: "server-wins",
    userNoticeRequired: true,
  },
  {
    stateConcern: "trading-ui-controls",
    ownerType: "shared-client-store",
    conflictPolicy: "server-wins",
    userNoticeRequired: false,
  },
  {
    stateConcern: "form-inline-transient-input",
    ownerType: "local-component",
    conflictPolicy: "server-wins",
    userNoticeRequired: false,
  },
];

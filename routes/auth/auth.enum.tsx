export const requestStatusEnum = {
  pending: 'pending',
  ready: 'ready',
  rejected: 'rejected'
} as const;

export type RequestStatus = typeof requestStatusEnum[keyof typeof requestStatusEnum];

export const QUEUES = {
  notifications: "notifications",
  emails: "emails",
  reports: "reports",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

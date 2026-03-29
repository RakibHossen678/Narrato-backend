import { Job, Queue, Worker } from "bullmq";
import { redis } from "./redis";
import { QUEUES, QueueName } from "../queues/jobs";
import { mailTransporter } from "./mail";
import { env } from "./env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

type ReportPayload = {
  reportId: string;
};

const connection = redis
  ? {
      host: redis.options.host,
      port: redis.options.port,
      password: redis.options.password,
      username: redis.options.username,
    }
  : undefined;

const buildQueue = (name: QueueName): Queue | null => {
  if (!connection) {
    return null;
  }

  return new Queue(name, { connection });
};

export const notificationQueue = buildQueue(QUEUES.notifications);
export const emailQueue = buildQueue(QUEUES.emails);
export const reportQueue = buildQueue(QUEUES.reports);

export const startQueueWorkers = (): void => {
  if (!connection) {
    return;
  }

  new Worker(
    QUEUES.emails,
    async (job: Job<EmailPayload>) => {
      await mailTransporter.sendMail({
        from: env.smtpFrom,
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
      });
    },
    { connection },
  );

  new Worker(
    QUEUES.reports,
    async (_job: Job<ReportPayload>) => {
      // Report queue can be expanded with ML/moderation integrations.
      return;
    },
    { connection },
  );
};

import { createServer } from "http";
import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { startQueueWorkers } from "./config/queue";
import { setupSocket } from "./config/socket";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();
  startQueueWorkers();

  const server = createServer(app);
  setupSocket(server);

  server.listen(env.port, () => {
    console.log(`Narrato backend listening on ${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});

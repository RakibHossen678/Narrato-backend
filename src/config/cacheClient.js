const { createClient } = require("redis");
const config = require("./config");

let redisClient = null;
let isConnecting = false;

const getClient = async () => {
  if (!config.redis_url) return null;
  if (redisClient?.isOpen) return redisClient;
  if (isConnecting) return redisClient;

  isConnecting = true;
  redisClient = createClient({ url: config.redis_url });

  redisClient.on("error", (err) => {
    // Keep API available if redis is unavailable.
    console.error("Redis error:", err.message);
  });

  await redisClient.connect();
  isConnecting = false;
  return redisClient;
};

const getCache = async (key) => {
  const client = await getClient();
  if (!client) return null;

  const value = await client.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (_err) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  const client = await getClient();
  if (!client) return;

  await client.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};

module.exports = {
  getCache,
  setCache,
};

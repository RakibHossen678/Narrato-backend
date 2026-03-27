const clientsByUser = new Map();

const addClient = (userId, res) => {
  const key = String(userId);
  if (!clientsByUser.has(key)) {
    clientsByUser.set(key, new Set());
  }
  clientsByUser.get(key).add(res);
};

const removeClient = (userId, res) => {
  const key = String(userId);
  const clients = clientsByUser.get(key);
  if (!clients) return;

  clients.delete(res);
  if (clients.size === 0) {
    clientsByUser.delete(key);
  }
};

const publishToUser = (userId, payload) => {
  const key = String(userId);
  const clients = clientsByUser.get(key);
  if (!clients || clients.size === 0) return;

  const event = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((res) => res.write(event));
};

module.exports = {
  addClient,
  removeClient,
  publishToUser,
};

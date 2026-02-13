const mongoose = require("mongoose");
const config = require("./src/config/config");
const app = require("./app");

let server;

async function main() {
  try {
    await mongoose.connect(config.database_url);
    server = app.listen(config.port, () => {
      console.log(
        `Narrato Backend listening on port ${config.port}`,
      );
    });
  } catch (err) {
    console.log(err);
  }
}

main();

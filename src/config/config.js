require("dotenv").config();

const config = {
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  brevo_user: process.env.BREVO_USER,
  brevo_pass: process.env.BREVO_PASS,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
};

module.exports = config;

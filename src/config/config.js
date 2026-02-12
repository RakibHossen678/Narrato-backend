require("dotenv").config();

const config = {
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_SECRET_KEY,
  brevo_port: process.env.BREVO_PORT,
  user: process.env.BREVO_USER,
  pass: process.env.BREVO_PASS,
};

module.exports = config;

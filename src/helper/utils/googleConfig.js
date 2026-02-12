const { google } = require("googleapis");
const config = require("../../config/config");

const GoogleClientId = config.client_id;
const GoogleClientSecret = config.client_secret;

exports.oauth2Client = new google.auth.OAuth2(
  GoogleClientId,
  GoogleClientSecret,
  "postmessage",
);

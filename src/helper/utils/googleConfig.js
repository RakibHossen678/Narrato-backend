const {google} = require("googleapis")
const config = require("../../config/config")

const GoogleClientId = config.CLIENT_ID
const GoogleClientSecret = config.CLIENT_SECRET

exports.oauth2Client = new google.auth.OAuth2(GoogleClientId, GoogleClientSecret, "postmessage");
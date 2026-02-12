const nodemailer = require("nodemailer");
const config = require("../config/config");

// Create a transporter object using the default SMTP transport with Gmail service
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: config.user,
    pass: config.pass,
  },
});

/**
 * Function to send an email with an OTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} text - Text content of the email
 * @returns {Promise} - Promise representing the result of the email send operation
 */
const sendMailForOTP = async (to, subject, text, html = "") => {
  const mailOptions = {
    from: "rh491464@gmail.com",
    to, // Recipient address
    subject, // Subject line
    text, // Plain text body
    html, // HTML body
  };

  // Log mail options for debugging purposes
  try {
    // Send mail using the transporter object
    const info = await transporter.sendMail(mailOptions);
    return info; // Return the result of the send operation
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMailForOTP };

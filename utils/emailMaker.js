require("dotenv").config({ path: __dirname + "/./../.env" });

const emailMaker = {};

emailMaker.transport = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

emailMaker.makeEmailParams = (from, to, subject, text, html) => {
  return {
    from: `"${from}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };
};

emailMaker.makeSignupEmailBody = (user, verificationUrl) => {
  return `
  <p>Thanks for signing up - Here's your verification Email</p>
  <h3>Signup details</h3>
  <ul>
  <li>Email: ${user.email}</li>
  <li>Username: ${user.username}</li>
  </ul>
  <h3>Verfication Link</h3>
  <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
  `;
};

emailMaker.makeSignupEmailTextOnly = (user, verificationUrl) => {
  return `
  Thanks for signing up - Here's your verification Email\n
  Signup details\n\n
  Email: ${user.email}\n
  Username: ${user.username}\n\n
  Verfication Link\n
  (you can copy and paste this link in a browser)\n\n
  ${verificationUrl}
  `;
};

module.exports = { emailMaker };

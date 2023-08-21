const mailgun = require("mailgun-js");

const sendEmail = (options) => {
  // Configure your Mailgun credentials
  const mailgunConfig = {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  };

  // Send the invitation email to the user's email address
  const mailgunClient = mailgun(mailgunConfig);
  const emailData = {
    from: "nghianm2803@gmail.com",
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  mailgunClient.messages().send(emailData, (error, body) => {
    if (error) {
      console.error("Error sending email:", error);
      return next(new AppError(500, "Failed to send email", "Send Email Error"));
    } else {
      console.log("Email sent successfully:", body);
    }
  });
};

module.exports = sendEmail;

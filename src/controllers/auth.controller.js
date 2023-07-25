const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const authController = {};
const mailgun = require("mailgun-js");

// Configure your Mailgun credentials
const mailgunConfig = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "+password");
  if (!user) return next(new AppError(400, "Can not find your account", "Login Error"));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError(400, "Wrong password", "Login Error"));

  let accessToken = await user.generateToken();
  return sendResponse(res, 200, true, { user, accessToken }, null, "Login successful");
});

authController.sendInvitation = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check if the user already exists with the given email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(400, "User already exists", "Join Team Error"));
  }

  // Generate the invitation token
  const invitationToken = User.generateInvitationToken();

  // Construct the invitation link with the token
  // http://localhost:3000/setup-account?token=${invitationToken}
  const invitationLink = `${req.protocol}://localhost:3000/setup-account?token=${invitationToken}`;

  // Send the invitation email to the user's email address
  const mailgunClient = mailgun(mailgunConfig);
  const emailData = {
    from: "nghianm2803@gmail.com",
    to: email,
    subject: "Invitation to join the team",
    html: `
    <html>
    <head>
        <title>Invitation to Taskflow</title>
    </head>
    <body>
        <div>
            <h2>You have been invited to join Taskflow</h2>
            <p>Please click the following link to set up your account: <a href="${invitationLink}" target="_blank">Set Up Account</a></p>
        </div>
    </body>
    </html>
  `,
  };

  mailgunClient.messages().send(emailData, (error, body) => {
    if (error) {
      console.error("Error sending email:", error);
      return next(new AppError(500, "Failed to send invitation email", "Send Invitation Error"));
    } else {
      console.log("Email sent successfully:", body);
    }
  });

  // Return the response
  return res.status(200).json({
    success: true,
    message: "Invitation email sent successfully",
    data: emailData,
  });
});

// Endpoint employee setup account
authController.setupAccount = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  let { name, email, password } = req.body;

  // Validate the invitation token
  if (!token) {
    return next(new AppError(400, "Invalid invitation token", "Setup Account Error"));
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // Create a new user account
  const user = new User({
    name,
    email,
    password: password,
    role: "Employee",
  });

  // Save the user in the database
  await user.save();
  const accessToken = await user.generateToken();

  sendResponse(res, 200, true, { user, accessToken }, null, "Setup Account Successful");
});

module.exports = authController;

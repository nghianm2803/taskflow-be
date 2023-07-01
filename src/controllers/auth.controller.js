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
  if (!user) return next(new AppError(400, "Invalid credentials", "Login Error"));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError(400, "Wrong password", "Login Error"));

  accessToken = await user.generateToken();

  let oldTokens = user.tokens || [];

  if (oldTokens.length) {
    oldTokens = oldTokens.filter((t) => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await User.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { accessToken, signedAt: Date.now().toString() }],
  });

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
  const invitationLink = `${req.protocol}://${req.get("host")}/api/auth/invitation?token=${invitationToken}`;

  // Send the invitation email to the user's email address
  const mailgunClient = mailgun(mailgunConfig);
  const emailData = {
    from: "nghianm2803@doo.com",
    to: email,
    subject: "Invitation to join the team",
    text: `You have been invited to join the team. Please click the following link to create your account: ${invitationLink}`,
  };

  mailgunClient.messages().send(emailData, (error, body) => {
    if (error) {
      console.error("Error sending email:", error);
      return next(new AppError(500, "Failed to send invitation email", "Join Team Error"));
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

authController.joinSquad = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  // let { name, email, password } = req.body;

  // Validate the invitation token
  // You can implement your own validation logic here
  // if (!isValidInvitationToken(token)) {
  //   return next(new AppError(400, "Invalid invitation token", "Join Squad Error"));
  // }

  if (!token) {
    return next(new AppError(400, "Invalid invitation token", "Join Squad Error"));
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // Create a new user account
  const newUser = new User({
    email,
    password: password,
    role: "Employee",
  });

  // Save the user in the database
  await newUser.save();

  // Return a response indicating successful registration
  return res.status(200).json({
    success: true,
    message: "Registration successful",
    data: newUser,
  });
});

authController.logout = catchAsync(async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];

    if (!accessToken) return next(new AppError(400, "Authorization fail!", "Logout Error"));

    const tokens = req.user.tokens;

    const newTokens = tokens.filter((t) => t.accessToken !== accessToken);

    await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
  }

  // Return a success response indicating successful logout
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = authController;

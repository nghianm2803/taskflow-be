const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const authController = {};
const sendEmail = require("../helpers/sendEmail");
const crypto = require("crypto");

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

  const message = `
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
  </html>`;

  await sendEmail({
    to: email,
    subject: "Invitation to join the team",
    text: message,
  });

  // Return the response
  return res.status(200).json({
    success: true,
    message: "Invitation email sent successfully",
    data: message,
  });
});

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

authController.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check if the user already exists with the given email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(400, "User do not exists", "Send Email Error"));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${req.protocol}://localhost:3000/reset-password?resetToken=${resetToken}`;

  const message = `
  <html>
    <head>
        <title>Password Reset Request</title>
    </head>
    <body>
        <div>
            <h2>You have requested a password reset on Taskflow</h2>
            <p>Please click the following link to reset your password: <a href="${resetUrl}" target="_blank">Reset Password</a></p>
        </div>
    </body>
  </html>`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    text: message,
  });

  // Return the response
  return res.status(200).json({
    success: true,
    message: "Password Reset Request sent successfully",
    data: message,
  });
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

  if (!user) return next(new AppError(400, "Invalid reset token", "Reset Password Error"));

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.password, salt);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendResponse(res, 200, true, { user }, null, "Reset Password Successful");
});

module.exports = authController;

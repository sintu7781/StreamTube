import nodemailer from "nodemailer";
import { htmlTemplate } from "../templates/passwordResetEmail.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const getFromAddress = () => {
  const email = process.env.EMAIL_FROM;
  const name = process.env.EMAIL_FROM_NAME || "App Support";

  if (!email) throw new Error("EMAIL_FROM is required");

  // Prevent header injection
  const sanitizedName = name.replace(/[\r\n]/g, "");

  return `"${sanitizedName}" <${email}>`;
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: "Password Reset Request",
    html: htmlTemplate(resetUrl),
    text: `You requested a password reset. Visit this link to proceed: ${resetUrl}\nThis link expires in 15 minutes.`,
    headers: {
      "X-Mailer": "Our App",
      "X-Priority": "1", // High priority
    },
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

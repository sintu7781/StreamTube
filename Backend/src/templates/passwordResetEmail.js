export const htmlTemplate = (resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer { margin-top: 20px; font-size: 0.8em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to proceed:</p>
    
    <p style="margin: 25px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    
    <p>If you didn't request this, please ignore this email.</p>
    
    <div class="footer">
      <p>This link will expire in 10 minutes.</p>
      <p>For security reasons, we don't store your password. If you need help, contact our support team.</p>
    </div>
  </div>
</body>
</html>
`;

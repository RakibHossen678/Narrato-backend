const htmlTemplate = (otp) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f8ff;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.7);
                padding: 20px;
                border-radius: 16px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                margin: 20px;
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #dddddd;
            }
            .header h1 {
                font-size: 24px;
                color: #333333;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content p {
                font-size: 18px;
                color: #555555;
            }
            .otp-box {
                display: inline-block;
                padding: 15px 30px;
                border-radius: 8px;
                background: linear-gradient(145deg, #e0f7fa, #ffffff);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px 0;
            }
            .otp {
                font-size: 24px;
                color: #333333;
                font-weight: bold;
                letter-spacing: 2px;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                border-top: 1px solid #dddddd;
                margin-top: 20px;
                color: #999999;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset OTP</h1>
            </div>
            <div class="content">
                <p>Your OTP for password reset is:</p>
                <div class="otp-box">
                    <span class="otp">${otp}</span>
                </div>
                <p>This OTP is valid for 10 minutes. Please use it promptly.</p>
            </div>
            <div class="footer">
                <p>If you did not request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

module.exports = {
  htmlTemplate,
};

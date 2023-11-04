const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'ivanandesramos.io@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  // await transporter.verify();
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

const { createTransport } = require('nodemailer');

exports.sendEmail = async (options) => {
  //create a transported
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // define email options
  const mailOptions = {
    from: 'Roman Parkhomenko <admin@te.st>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  //send the email
  await transporter.sendMail(mailOptions);
};

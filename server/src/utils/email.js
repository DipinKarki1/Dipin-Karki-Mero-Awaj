import nodemailer from 'nodemailer';

const buildTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS in server .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = buildTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  return transporter.sendMail({
    from: `Mero Awaj <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
};

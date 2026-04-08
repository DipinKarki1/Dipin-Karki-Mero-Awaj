import sgMail from '@sendgrid/mail';

const getApiKey = () => {
  const apiKey = process.env.SEND_GRID_API_KEY;
  if (!apiKey) {
    throw new Error('Email service not configured. Please set SEND_GRID_API_KEY in server .env');
  }
  return apiKey;
};

const getFromAddress = () => {
  const fromAddress =
    process.env.SEND_GRID_FROM_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (!fromAddress) {
    throw new Error('Email service not configured. Please set SEND_GRID_FROM_EMAIL in server .env');
  }

  return fromAddress;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  sgMail.setApiKey(getApiKey());

  const msg = {
    to,
    from: getFromAddress(),
    subject,
  };

  if (text) {
    msg.text = text;
  }

  if (html) {
    msg.html = html;
  }

  return sgMail.send(msg);
};

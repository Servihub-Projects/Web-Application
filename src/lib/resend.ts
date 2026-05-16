type SendEmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export const resend = {
  emails: {
    async send(_payload: SendEmailPayload) {
      throw new Error('Email delivery is not configured. Add a real Resend client before enabling password reset emails.');
    },
  },
};

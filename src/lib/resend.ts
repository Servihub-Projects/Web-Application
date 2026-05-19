type SendEmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export const resend = {
  emails: {
    async send(payload: SendEmailPayload) {
      void payload;
      throw new Error('Email delivery is not configured. Add a real Resend client before enabling password reset emails.');
    },
  },
};

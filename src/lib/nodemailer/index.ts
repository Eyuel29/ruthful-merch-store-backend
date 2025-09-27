import type { Transporter } from 'nodemailer';

import { createTransport } from 'nodemailer';

import env from '@/env';

export const emailTransporter: Transporter = createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_ADDRESS,
    pass: env.EMAIL_PASS,
  },
});

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';

import { db } from '@/db/index';
import * as schema from '@/db/schema';
import env from '@/env';

import { emailTransporter } from './email/index';
import { generateEmailTemplate } from './email/templates';

const tokenLifeTime = env.TOKEN_LIFETIME;
const allowedOrigins = env.ALLOWED_ORIGINS?.split(',');

export const auth = betterAuth({
  appName: env.APP_NAME,
  trustedOrigins: allowedOrigins,
  database: drizzleAdapter(db, {
    schema,
    provider: 'pg',
  }),
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 100,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: tokenLifeTime,
    sendResetPassword: async (data, _) => {
      const html = generateEmailTemplate({
        user: data.user,
        title: 'Reset Password Request',
        url: data.url,
        message:
          'You requested a password reset. Click the button below to set up your new password.',
      });

      try {
        await emailTransporter.sendMail({
          from: env.EMAIL_ADDRESS,
          sender: env.SENDER_ADDRESS,
          to: [data.user.email],
          subject: 'Reset Password',
          html,
        });
      }
      catch (error) {
        console.error(error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      roles: {
        type: 'string[]',
        required: true,
        defaultValue: ['customer'],
      },
    },
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: tokenLifeTime,
      sendDeleteAccountVerification: async (data, _) => {
        const html = generateEmailTemplate({
          user: data.user,
          title: 'Delete Account Request',
          url: data.url,
          message:
            'You requested to delete your account. Click the button below to confirm and continue.',
        });

        try {
          await emailTransporter.sendMail({
            from: env.EMAIL_ADDRESS,
            sender: env.SENDER_ADDRESS,
            to: [data.user.email],
            subject: 'Delete Account',
            html,
          });
        }
        catch (error) {
          console.error(error);
        }
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (data, _) => {
        const html = generateEmailTemplate({
          user: data.user,
          title: 'Change Email Request',
          url: data.url,
          message:
            'You requested to change your email address. Click the button below to confirm and update your account.',
        });

        try {
          await emailTransporter.sendMail({
            from: env.EMAIL_ADDRESS,
            sender: env.SENDER_ADDRESS,
            to: [data.user.email],
            subject: 'Change Email',
            html,
          });
        }
        catch (error) {
          console.error(error);
        }
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowUnlinkingAll: true,
    },
  },
  session: {
    expiresIn: env.SESSION_LIFETIME,
    preserveSessionInDatabase: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  emailVerification: {
    sendVerificationEmail: async (data, _) => {
      const html = generateEmailTemplate({
        user: data.user,
        title: 'Verify Email Address',
        url: data.url,
        message:
          'Please verify your email address by clicking the button below to complete the process.',
      });

      try {
        await emailTransporter.sendMail({
          from: env.EMAIL_ADDRESS,
          sender: env.SENDER_ADDRESS,
          to: [data.user.email],
          subject: 'Verify Email',
          html,
        });
      }
      catch (error) {
        console.error(error);
      }
    },
    expiresIn: tokenLifeTime,
  },
  rateLimit: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: 'rh',
    database: {
      generateId: false,
    },
  },
});

export interface Auth {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
}

export default auth;

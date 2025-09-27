import type { user } from '@/db/schema';

import env from '@/env';

type User = typeof user.$inferInsert;
type EmailVariant = 'default' | 'destructive';

const style = `
    body {
        font-family: Arial, sans-serif;
        background-color: #f7f7f7;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
    
    .email-container {
        background-color: #fff;
        border-radius: 8px;
        padding: 40px 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 400px;
        width: 100%;
        text-align: center;
    }

    .logo {
        width: 40px;
        height: 40px;
        background-color: #111;
        border-radius: 50%;
        display: inline-block;
        margin-bottom: 20px;
        position: relative;
    }

    .logo::before {
        content: "";
        position: absolute;
        top: 9px;
        left: 9px;
        width: 22px;
        height: 22px;
        background-image: radial-gradient(#fff 5%, transparent 5%);
        background-size: 4px 4px;
        background-repeat: repeat;
    }

    h1 {
        font-size: 22px;
        margin-bottom: 20px;
    }

    p {
        font-size: 16px;
        color: #555;
        margin-bottom: 30px;
        text-align: justify;
    }

    .confirm-button {
        display: inline-block;
        background-color: #007aff;
        color: #fff;
        padding: 12px 25px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
    }

    .confirm-button-destructive {
        background-color: #f84646ff;
    }

    .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #999;
    }

    .footer a {
        color: #ccc;
        text-decoration: none;
        margin-left: 5px;
    }

    hr {
        border: none;
        border-top: 1px solid #eee;
        margin: 30px 0;
    }
`;

export function generateEmailTemplate({
  user,
  url,
  title,
  message,
  variant = 'default',
}: {
  user: User;
  url: string;
  title: string;
  message: string;
  variant?: EmailVariant;
}) {
  const minutes = Math.ceil(env.TOKEN_LIFETIME / (1000 * 60));
  const tokenLifetime = `${minutes} minute${minutes > 1 ? 's' : ''}`;

  const buttonClass
    = variant === 'destructive' ? 'confirm-button confirm-button-destructive' : 'confirm-button';

  return `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
        ${style}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo"></div>
            <h1>${title}</h1>
            <p>
                Dear ${user.name}, 
                
                ${message} 
                
                The link is valid for ${tokenLifetime}.
            </p>
            <a class="${buttonClass}" target="_blank" href="${url}">Confirm</a>
            <p>If you did not request this, you can safely ignore this email.</p>
            <hr />
            <div class="footer">
                &copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
            </div>
        </div>
    </body>
    </html>
  `;
}

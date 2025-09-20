import 'dotenv/config';
import readline from 'node:readline/promises';
import { google } from 'googleapis';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function main() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // e.g., http://localhost:3001/auth/google/callback
  );

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  });

  console.log('\n1) Open this URL in your browser and approve:\n');
  console.log(authUrl);

  const code = await rl.question('\n2) After redirect, copy the "code" query param and paste here:\n> ');
  rl.close();

  const { tokens } = await oauth2.getToken(code.trim());
  console.log('\n3) Tokens:');
  console.log({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });

  if (!tokens.refresh_token) {
    console.error('\nNo refresh_token returned.\n- Revoke the app at https://myaccount.google.com/permissions\n- Run again (prompt=consent & access_type=offline are already set).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

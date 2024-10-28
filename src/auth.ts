import { exec } from 'node:child_process';
import fs from 'node:fs';

import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

const accessTokenFile = 'access_token.txt';

function hasAccessToken() {
  return fs.existsSync(accessTokenFile);
}

function getAccessTokenFromFile() {
  if (hasAccessToken()) {
    return fs.readFileSync(accessTokenFile, 'utf8');
  } else {
    return null;
  }
}

let accessToken = getAccessTokenFromFile();

export function clearAccessToken() {
  if (hasAccessToken()) {
    fs.rmSync(accessTokenFile);
    accessToken = null;
  }
}

export const auth = createOAuthDeviceAuth({
  clientType: 'oauth-app',
  clientId: 'Ov23liFhIcWrT9HuEqgo',
  scopes: ['repo'],
  onVerification: (verification) => {
    console.log('Authenticating with GitHub...');
    exec(`open ${verification.verification_uri}`);
    console.log(`Open ${verification.verification_uri} in your browser.`);
    console.log(`Enter code: ${verification.user_code}`);
  },
});

export const authToken = async () => {
  let token;
  if (accessToken) {
    token = accessToken;
  } else {
    token = JSON.stringify(await auth({ type: 'oauth', scopes: ['repo'] }));
    fs.writeFileSync(accessTokenFile, token);
  }
  return JSON.parse(token);
};

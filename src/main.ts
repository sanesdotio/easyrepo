#!/usr/bin/env node

import { Octokit } from '@octokit/rest';

import { authToken, clearAccessToken } from './auth.ts';

const main = async () => {
  console.log('Starting EasyRepo...');
  const getAuthToken = await authToken();

  const octokit = new Octokit({
    auth: getAuthToken.token,
    userAgent: 'easyrepo',
    baseUrl: 'https://api.github.com',
  });

  try {
    await octokit.users.getAuthenticated();
  } catch (error) {
    console.log('Invalid access token, retrying...');
    clearAccessToken();
    const newAuthToken = await authToken();
    octokit.auth = newAuthToken.token;
  }

  console.log(`Hi, ${(await octokit.users.getAuthenticated()).data.login}!`);
};

main();

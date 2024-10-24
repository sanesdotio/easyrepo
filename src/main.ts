#!/usr/bin/env node

import { authToken } from './auth.ts';

const main = async () => {
  const token = await authToken();
  console.log(`main.ts auth token: ${token}`);
};

main();

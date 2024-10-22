import { request } from 'node:https';
import open from 'open';

import { clientId } from 'env.ts';

export const authToken = async (): Promise<string> => {
  const options = {
    hostname: 'github.com',
    path: '/login/device/code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  const postData = JSON.stringify({
    client_id: clientId,
    scope: 'repo',
  });

  return new Promise((resolve, reject) => {
    const req = request(options, async (res) => {
      console.log(`authToken request statusCode: ${res.statusCode}`);
      let dataBuffer = '';

      res.on('data', (data) => {
        dataBuffer += data;
      });

      res.on('end', async () => {
        try {
          const data = JSON.parse(dataBuffer);

          if (data && data.user_code) {
            console.log(
              `To authenticate with GitHub, please visit ${data.verification_uri}, and enter the following code: ${data.user_code}`
            );

            await open(data.verification_uri);

            const token = await getToken(data.device_code, data.interval);
            resolve(token);
          } else {
            reject(new Error(data.error));
          }
        } catch (error) {
          error instanceof Error
            ? reject(`${error.message}`)
            : reject(`${error}`);
        }
      });
    });

    req.on('error', (error) => {
      reject(error.message);
    });

    req.write(postData);
    req.end();
  });
};

const getToken = async (
  deviceCode: string,
  interval: number
): Promise<string> => {
  const options = {
    hostname: 'github.com',
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  const postData = JSON.stringify({
    client_id: process.env.CLIENT_ID,
    device_code: deviceCode,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
  });

  return new Promise((resolve, reject) => {
    const pollTokenReq = setInterval(() => {
      const req = request(options, (res) => {
        // console.log(`getToken request statusCode: ${res.statusCode}`);
        let dataBuffer = '';

        res.on('data', (chunk) => {
          dataBuffer += chunk;
        });

        res.on('end', () => {
          const data = JSON.parse(dataBuffer);

          if (data && data.access_token) {
            // Access token successfully received
            clearInterval(pollTokenReq);
            resolve(data.access_token);
          } else if (data && data.error == 'expired_token') {
            // Device code has expired
            clearInterval(pollTokenReq);
            reject(data.error_description);
          } else if (data && data.error == 'access_denied') {
            // User denied access
            clearInterval(pollTokenReq);
            reject(data.error_description);
          } else if (data && data.error == 'slow_down') {
            // Rate limit exceeded
            clearInterval(pollTokenReq);
            reject(data.error_description);
          }
        });
      });

      req.on('error', (error) => {
        reject(`${error.message}`);
      });

      req.write(postData);
      req.end();
    }, (interval + 1) * 1000);
  });
};

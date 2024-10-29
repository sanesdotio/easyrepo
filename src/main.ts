#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import { simpleGit } from 'simple-git';
import { input, confirm, rawlist } from '@inquirer/prompts';
import { exec } from 'node:child_process';

import { authToken, clearAccessToken } from './auth.ts';

const main = async () => {
  try {
    console.log('Starting EasyRepo...');
    // Authenticating with GitHub
    const getAuthToken = await authToken();
    const git = simpleGit();

    // Creating a new Octokit instance with the auth token
    const octokit = new Octokit({
      auth: getAuthToken.token,
      userAgent: 'easyrepo',
      baseUrl: 'https://api.github.com',
    });

    let authUser;

    // Retrieving the authenticated user
    // If the access token is invalid, it will be cleared and the user will be prompted to reauthenticate
    try {
      authUser = await octokit.users.getAuthenticated();
    } catch (error) {
      console.log('Invalid access token, retrying...');
      clearAccessToken();
      const newAuthToken = await authToken();
      octokit.auth = newAuthToken.token;
    }

    console.log(`Hi, ${authUser?.data.login}!`);

    const licenseChoices = await octokit.rest.licenses.getAllCommonlyUsed();

    const answers = {
      repoName: await input({ message: 'Repository name: ' }),
      repoDescription: await input({ message: 'Repository description: ' }),
      isPrivate: await confirm({ message: 'Private repository? ' }),
      hasReadme: await confirm({ message: 'Create README file? ' }),
      hasGitignore: await confirm({ message: 'Create .gitignore file? ' }),
      hasLicense: await confirm({ message: 'Create LICENSE file? ' }),
      license: '',
    };

    if (answers.hasLicense) {
      answers.license = await rawlist({
        message: 'Choose a license: ',
        choices: licenseChoices.data.map((license) => {
          return {
            name: license.name,
            value: license.key,
          };
        }),
      });
    }

    console.log(
      '\n',
      `Repository name: ${answers.repoName}\n`,
      `Repository description: ${answers.repoDescription}\n`,
      `Private repository: ${answers.isPrivate}\n`,
      `Create README file: ${answers.hasReadme}\n`,
      `Create LICENSE file: ${answers.hasLicense}\n`,
      `License: ${answers.license}\n`
    );
    const confirmation = await confirm({
      message: 'Are you sure you want to create this repository? ',
    });

    if (!confirmation) {
      console.log('Aborting...');
      return;
    }

    let repoData;
    try {
      console.log('Creating remote repository...');
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name: answers.repoName,
        description: answers.repoDescription,
        private: answers.isPrivate,
        auto_init: answers.hasReadme,
        license_template: answers.license,
      });
      repoData = data;
      console.log(`Remote repository created successfully!`);
    } catch (error) {
      console.error(`Error creating remote repository: ${error}`);
    }

    try {
      if (repoData?.html_url) {
        console.log('Initializing local repository...');
        await git.init();
        const remoteRepoName = await input({
          message: 'Remote repository name: ',
        });
        console.log('Connecting remote repository...');
        await git.addRemote(remoteRepoName, repoData.html_url);
        console.log('Cloning repository...');
        await git.clone(repoData.html_url);
      }
    } catch (error) {
      console.error(`Error adding remote repository: ${error}`);
    }

    console.log(
      `Repository created successfully!\n Repository URL: ${repoData?.html_url}`
    );
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

main();

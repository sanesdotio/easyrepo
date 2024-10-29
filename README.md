# EasyRepo

## A CLI tool for simple Git repository setup in one step

### Installation

The install script below will install EasyRepo globally on your local machine. You can then call it from anywhere to initiate your project!

```sh

curl  -fsSL  https://raw.githubusercontent.com/sanesdotio/easyrepo/main/install.sh  |  sh

```

### Description

EasyRepo is a CLI tool that simplifies repository setup for new projects.
Based on the user's input, it will:

- Authenticate to the user's GitHub account
- Create a new GitHub repository on the users's account with:
  - Repository name
  - Repository description
  - Private or public repository
  - README
  - LICENSE
- Initialize local Git repository
- Connect local to remote repository on GitHub
- Clone the remote repository to local

And your project is good to go!

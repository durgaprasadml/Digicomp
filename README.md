# Digicomp Technologies website

Code repository for Digicomp Technologies websites.

## Current sites
- [digicomp.app](https://digicomp.app/) -> Public facing website

## First time setup (Remote Server)
If you are deploying this theme to a fresh WordPress install on your remote server, you can use the automated deploy script from your local machine.

1. Ensure you have SSH access to your server configured locally (the script uses the host alias `kartnc`).
2. Setup WordPress and DB on the server
3. Run the deployment script from the theme root: `./deploy.sh`

Once the first time setup is complete, you can use the automated GitHub Action (`v*` tags) for future deployments.

## Installation (Manual/Local)
- Install WordPress with multisite
- Copy this theme folder to `wp-content/themes/dc`
- Under `cd frontend/home` Run `npm run build` to build home page.
- Add `node` to server path. (Download binary directly if in shared hosting)
- Add cron to run SSR `* * * * * {path-to}/node {dc-path}/frontend/home/ssr.js`
- Add `DEPLOY_SECRET` in Github > digicomp-app > Settings
- Add `define( 'GITHUB_DEPLOY_SECRET', 'STRONG_SECRET_HERE' );` to wp-config.php

## Local development
- Easily create local development environment with [localwp](https://localwp.com/).
- Follow the above installation instructions.
- Get FTP username, password, and FTP Address from IT department.
- Add `.vscode/sftp.json` under `local/{dcworld}/app/public`, and add the following code
  ```
  {
    "name": "SKAI",
    "host": "{FTP Address}",
    "protocol": "ftp",
    "port": 21,
    "username": "user@digicomp.app",
    "password": "Strong Password",
    "remotePath": "/",
    "uploadOnSave": false,
    "useTempFile": false,
    "openSsh": false
  }
  ```

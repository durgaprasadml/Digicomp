# Digicomp Technologies website

Code repository for Digicomp Technologies websites.

## Current sites
- [digicomp.app](https://digicomp.app/) -> Public facing website

## Installation
- Install WordPress with multisite
- Copy this theme folder to `wp-content/themes/dc`
- Check `dc/plugins` folders and create corresponding plugins in the main plugins folder.
  Eg:
  ```
  <?php
  /*
  * Plugin Name: Digicomp Essentials
  * Description: Essential functionalities for Digicomp Site
  * Version: 1.0.0
  */

  require_once get_theme_root( 'dc' ) . '/dc/plugins/dc-essentials/index.php';
  ```
- Under `cd frontend/home` Run `npm run build` to build home page.
- Add `node` to server path. (Download binary directly if in shared hosting)
- Add cron to run SSR `* * * * * {path-to}/node {dc-path}/frontend/home/ssr.js`

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

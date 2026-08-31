# About the Project
This is a WordPress backend and React frontend ecommerce website for Digicomp Technologies that manufactures and sells electronic components and development boards. This is a local environment.

## Hero UI Component usage
If you are using HeroUI component, strictly follow instructions in `heroui-docs` folder or the source code directly in `node_modules/@heroui` to understand the usage. Your pretrained knowledge is of older HeroUI version. DO NOT ASSUME OLDER VERSION WORKS. There are many breaking changes and most of the older version syntax does not work.

## Frontend Testing
Puppeteer is installed under `tmp/`. When you make any changes to UI, run at least one simple puppeteer test to make sure that nothing breaks. If the change is large, write specific test and make sure that everything works as expected.

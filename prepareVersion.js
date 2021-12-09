const package = require('./package.json');
const fs = require('fs');

console.log(`Preparing Version v${package.version}`);

// Set version into app info
// fs.writeFileSync('src/app/app.info.ts', `export const APP_VERSION = '${package.version}';`, 'utf-8');

const versionParts = /(\d+)\.(\d+)\.?(\d+)?/g.exec(package.version);
const marketingVersion = (versionParts[1] || '0') + '.' + (versionParts[2] || '0');
const buildVersion = versionParts[3] || '0';

// Set version into iOS project file
const IOS_PROJECT_FILE = 'ios/App/App.xcodeproj/project.pbxproj';
let iosProject = fs.readFileSync(IOS_PROJECT_FILE, 'utf-8');
iosProject = iosProject.replace(/CURRENT_PROJECT_VERSION = (\d+)/gi, 'CURRENT_PROJECT_VERSION = ' + buildVersion);
iosProject = iosProject.replace(/MARKETING_VERSION = (\d+)\.(\d+)/gi, 'MARKETING_VERSION = ' + marketingVersion);
fs.writeFileSync(IOS_PROJECT_FILE, iosProject, 'utf-8');

// Set version into Android project file
const ANDROID_PROJECT_FILE = 'android/app/build.gradle';
let androidProject = fs.readFileSync(ANDROID_PROJECT_FILE, 'utf-8');
let versionCode = +(/versionCode (.\d*)/gi.exec(androidProject)[1]);
androidProject = androidProject.replace(/versionName "(.*)"/gi, `versionName "${marketingVersion}"`);
androidProject = androidProject.replace(/versionCode (.\d*)/gi, `versionCode ${versionCode + 1}`);
fs.writeFileSync(ANDROID_PROJECT_FILE, androidProject, 'utf-8');

console.log(`Done been prepped`);

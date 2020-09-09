const path = require('path');
const semver = require('semver');
const NodeCache = require('node-cache');
const { fork } = require('child_process');
const { app } = require('electron');
const customizedFetch = require('../../customized-fetch');
const sendToAllWindows = require('../../send-to-all-windows');
const { getPreference, getPreferences } = require('../../preferences');

// force re-extract for first installation after launch
global.forceExtract = true;

const cache = new NodeCache();

// use in-house API
// to avoid using GitHub API as it has rate limit (60 requests per hour)
// https://github.com/atomery/webcatalog/issues/890
const getTagNameAsync = () => Promise.resolve()
  .then(() => {
    const allowPrerelease = getPreference('allowPrerelease');

    // check both prerelease and stable channels
    // return the newer version
    if (allowPrerelease) {
      return Promise.resolve()
        .then(() => {
          let stableVersion;
          let prereleaseVersion;
          const p = [
            customizedFetch('https://atomery.com/webcatalog/juli/releases/latest.json')
              .then((res) => res.json())
              .then((data) => { stableVersion = data.version; }),
            customizedFetch('https://atomery.com/webcatalog/juli/releases/prerelease.json')
              .then((res) => res.json())
              .then((data) => { prereleaseVersion = data.version; }),
          ];
          return Promise.all(p)
            .then(() => {
              if (semver.gt(stableVersion, prereleaseVersion)) {
                return stableVersion;
              }
              return prereleaseVersion;
            });
        })
        .then((version) => `v${version}`);
    }

    return customizedFetch('https://atomery.com/webcatalog/juli/releases/latest.json')
      .then((res) => res.json())
      .then((data) => `v${data.version}`);
  });

const downloadExtractTemplateAsync = (tagName) => new Promise((resolve, reject) => {
  let latestTemplateVersion = '0.0.0';
  const scriptPath = path.join(__dirname, 'forked-script.js');

  const {
    proxyPacScript,
    proxyRules,
    proxyType,
  } = getPreferences();

  const args = [
    '--appVersion',
    app.getVersion(),
    '--templatePath',
    path.join(app.getPath('userData'), 'webcatalog-template'),
    '--templateZipPath',
    path.join(app.getPath('userData'), 'webcatalog-template.zip'),
    '--platform',
    process.platform,
    '--arch',
    process.arch,
    '--tagName',
    tagName,
  ];

  const cachedTemplateInfoJson = cache.get(`templateInfoJson.${tagName}`);
  if (cachedTemplateInfoJson) {
    args.push('--templateInfoJson');
    args.push(cachedTemplateInfoJson);
  }

  const child = fork(scriptPath, args, {
    env: {
      ELECTRON_RUN_AS_NODE: 'true',
      ELECTRON_NO_ASAR: 'true',
      APPDATA: app.getPath('appData'),
      PROXY_PAC_SCRIPT: proxyPacScript,
      PROXY_RULES: proxyRules,
      PROXY_TYPE: proxyType,
      FORCE_EXTRACT: Boolean(global.forceExtract).toString(),
    },
  });

  let err = null;
  child.on('message', (message) => {
    if (message && message.templateInfo) {
      latestTemplateVersion = message.templateInfo.version;
      // cache template info for the tag name indefinitely (until app is quitted)
      cache.set(`templateInfoJson.${tagName}`, JSON.stringify(message.templateInfo));
    } else if (message && message.progress) {
      sendToAllWindows('update-installation-progress', message.progress);
    } else if (message && message.error) {
      err = new Error(message.error.message);
      err.stack = message.error.stack;
      err.name = message.error.name;
    } else {
      console.log(message); // eslint-disable-line no-console
    }
  });

  child.on('exit', (code) => {
    if (code === 1) {
      reject(err || new Error('Forked script failed to run correctly.'));
      return;
    }

    // // extracting template code successful so need to re-extract next time
    global.forceExtract = false;

    resolve(latestTemplateVersion);
  });
});

const prepareTemplateAsync = () => getTagNameAsync()
  .then((tagName) => downloadExtractTemplateAsync(tagName));

module.exports = prepareTemplateAsync;

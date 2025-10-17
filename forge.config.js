const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    name: 'Trial Randomizer',
    executableName: 'trialrandomizer',
    icon: './build/icon',
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'trialrandomizer',
        authors: 'florenzobauer',
        exe: 'trialrandomizer.exe',
        iconUrl: 'https://raw.githubusercontent.com/FlorenzoBauer/trialrandomizer/main/build/icon.ico',
        setupIcon: './build/icon.ico',
        loadingGif: './build/installer.gif',
        noMsi: false,
        remoteReleases: 'https://github.com/FlorenzoBauer/trialrandomizer'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'FlorenzoBauer',
          name: 'trialrandomizer'
        },
        prerelease: false,
        draft: true
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
const extensionConfig = require('./lighthouserc.cjs');
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview:site',
      startServerReadyPattern: 'Pages preview',
      url: ['http://127.0.0.1:4178/tabibe/', 'http://127.0.0.1:4178/tabibe/tr/'],
      numberOfRuns: 1,
      settings: extensionConfig.ci.collect.settings,
    },
    assert: extensionConfig.ci.assert,
    upload: { target: 'filesystem', outputDir: './lighthouse-results/site' },
  },
};

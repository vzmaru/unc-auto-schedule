const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://hnd-p-ols.spectrumng.net/uncwellness',
    experimentalStudio: true,
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

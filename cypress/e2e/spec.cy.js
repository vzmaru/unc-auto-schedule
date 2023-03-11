const { login, bookChoice, logout } = require('../support/utils');

// uncschedapi-1-x0827218.deta.app
const spaceHost = Cypress.env('UNC_APP_HOST');
const uncApiKey = Cypress.env('UNC_APP_API_KEY');


describe('UNC Schedule Automation', () => {
  it('Book Choices', () => {
    cy.request({
      url: `https://${spaceHost}/sched/active`,
      headers: {
        "X-Space-App-Key": uncApiKey,
      },
    })
      .then((response) => {
        const choices = response.body;
        if (choices.length > 0) {
          login();

          choices.forEach((choice) => {
            bookChoice(choice);
          });

          logout();
        }
      })

  })

})

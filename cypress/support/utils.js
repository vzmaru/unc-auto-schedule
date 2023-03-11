// uncschedapi-1-x0827218.deta.app
const spaceHost = Cypress.env('UNC_APP_HOST');
const uncApiKey = Cypress.env('UNC_APP_API_KEY');


export function login() {
    const { username, password } = { username: Cypress.env('UNC_USER'), password: Cypress.env('UNC_PSWD') };

    cy.visit('/Login.aspx?isKiosk=False');

    cy.get('input[id=ctl00_pageContentHolder_loginControl_UserName]').type(username);
    cy.get('input[id=ctl00_pageContentHolder_loginControl_Password]').type(`${password}{enter}`);

    // we should be redirected to /Home.aspx
    cy.url().should('include', '/Home.aspx');
    // UI should reflect this user being logged in
    cy.get('#ctl00_welcomeCnt_phMain').should('contain', 'Welcome');
}

export function logout() {
    cy.get('#ctl00_welcomeCnt_ancSignOut').click();
}


export async function bookChoice(choice) {
    cy.request({
        url: `https://${spaceHost}/sched/book`,
        method: 'PUT',
        headers: {
            "X-Space-App-Key": uncApiKey,
        },
        body: { key: choice.key, date: choice.nextSched }
    }).then(
        (response) => {
            // response.body is automatically serialized into JSON
            expect(response.body).to.have.property('message', 'OK') // true
        }
    );

    switch (choice.type) {
        case 'schedule':
            bookSchedule(choice);
            break;
        case 'aquatics':
            bookAquatics(choice);
            break;
        case 'climbing_wall':
            bookClimbingWall(choice);
            break;
        case 'program':
            bookProgram(choice);
            break;
        default:
            bookGroupClass(choice);
            break;
    }
}


function pickDate(date) {
    cy.get('.ui-datepicker-year').select(date.getFullYear().toString());
    cy.get('.ui-datepicker-month').select(date.getMonth().toString());
    cy.contains('.ui-state-default', date.getDate().toString()).click();
}


export function bookSchedule(choice) {
    cy.visit('/Home.aspx?isKiosk=False');

    // TODO: schedule type
    cy.get('#menu_SCH').click();
    cy.get(`div[title=${choice.category}]`).click();

    if (choice.category == "Aquatics") {
        cy.get(':nth-child(2) > #divContainer > .sm-image > #imgPicture').click();
    } else {
        cy.get(':nth-child(1) > #divContainer > .sm-image > #imgPicture').click();
    }
    cy.get('.ui-datepicker-trigger').click();
    // class="ui-datepicker-month"
    // class="ui-datepicker-year"
    // <a class="ui-state-default" href="#">10</a>
    const next_day = new Date(choice.nextSched);
    //Access minPrice here
    pickDate(next_day);
    cy.get('#btnContinue').click();

    if (choice.category == "Aquatics") {
        cy.get('#dk_container_ctl00_pageContentHolder_ddlTimeOfDay > a').click();
        // TODO: get last 15 min mark from choice.time
        cy.contains('a', findLastQuaterHr(choice.time)).click();
        // <li class=" "><a data-dk-dropdown-value="1020">05:00 PM</a></li>
        cy.get('#ancSchSearch').click();
    } else {
        cy.get('#ancSchListView').click();
    }

    // return next_day; /////////

    cy.get('.tblSchslots tr').filter(`:contains("${choice.time}")`).filter(`:contains("${choice.resource}")`)
        .find('a')
        .click();
    cy.get('#btnContinue').click();

    if (choice.category == "Climbing Wall") {
        cy.get('#btnAcceptWaiver').click();
    }

    // cy.get('#ctl00_pageContentHolder_pnlOuterErrorMessage').should('not.exist');

    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="checkbox"]').check({ force: true });
    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="radio"]').check({ force: true });

    // Continue to Cart
    cy.get('#ctl00_pageContentHolder_btnContinueCart').click();
    // Success
    cy.get('#ctl00_pageContentHolder_lblThankYou').should('contain', 'Booked');

    return next_day;
}

function findLastQuaterHr(time) {
    const timeRegex = /([0-9]+):([0-9]+) (\w+)/;
    const match = time.match(timeRegex);
    const hours = match[1];
    const minutes = match[2];
    const ampm = match[3];

    var m = (Math.floor(minutes/15) * 15) % 60;

    return `${hours}:${('0'+m).slice(-2)} ${ampm}`;
}

export function bookAquatics(choice) {
    cy.visit('/Home.aspx?isKiosk=False');

    // TODO: schedule type
    cy.get('#menu_SCH').click();
    cy.get('div[title=Aquatics]').click();
    // cy.get('div[title="Climbing Wall"]').click();

    cy.get(':nth-child(2) > #divContainer > .sm-image > #imgPicture').click();
    cy.get('.ui-datepicker-trigger').click();
    // class="ui-datepicker-month"
    // class="ui-datepicker-year"
    // <a class="ui-state-default" href="#">10</a>
    const next_day = new Date(choice.nextSched);
    pickDate(next_day);
    cy.get('#btnContinue').click();
    cy.get('#dk_container_ctl00_pageContentHolder_ddlTimeOfDay > a').click();
    // TODO: get last 15 min mark from choice.time
    cy.contains('a', '05:00 PM').click();
    // <li class=" "><a data-dk-dropdown-value="1020">05:00 PM</a></li>
    cy.get('#ancSchSearch').click();

    // return next_day; /////////

    cy.get('.tblSchslots tr').filter(`:contains("${choice.time}")`).filter(`:contains("${choice.resource}")`)
        .find('a')
        .click();
    cy.get('#btnContinue').click();

    // cy.get('#ctl00_pageContentHolder_pnlOuterErrorMessage').should('not.exist');

    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="checkbox"]').check({ force: true });
    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="radio"]').check({ force: true });

    // Continue to Cart
    cy.get('#ctl00_pageContentHolder_btnContinueCart').click();
    // Success
    cy.get('#ctl00_pageContentHolder_lblThankYou').should('contain', 'Booked');

    return next_day;
}


export function bookProgram(choice) {
    cy.visit('/Home.aspx?isKiosk=False');

    cy.get("#menu_PRG").click();
    // TODO: verify swim is available

    // category = Aquatics
    cy.get(".prlistDivdor").filter(`:contains('${choice.category}')`).find('[type="button"]').click();
    cy.get(".campListGrid tr").filter(`:contains('${choice.resource}')`).find('[type="button"]').click();
    cy.get(`[title='${choice.resource} ${choice.time}']`).parent().siblings().find('[type="button"][value="Add to Cart"]').click();

    cy.get("#ctl00_pageContentHolder_CrtlWaiverControl_btnContinue").click();

    cy.get('#ctl00_pageContentHolder_ctrlFamilyMember_gvMembers tr').filter(`:contains("${choice.member}")`).find('[type="checkbox"]').check({ force: true });
    cy.get('#ctl00_pageContentHolder_ctrlFamilyMember_gvMembers tr').not(`:contains("${choice.member}")`).find('[type="checkbox"]').uncheck({ force: true });

    // Continue to Cart
    cy.get('#ctl00_pageContentHolder_btnContinueCart').click();
    // TODO: payment
    cy.get('#ctl00_pageContentHolder_btnSubmit').click();

    // Success
    cy.get('#ctl00_pageContentHolder_lblThankYou').should('contain', 'Booked');

}


export function bookClimbingWall(choice) {
    cy.visit('/Home.aspx?isKiosk=False');

    // TODO: schedule type
    cy.get('#menu_SCH').click();
    cy.get('div[title="Climbing Wall"]').click();

    cy.get(':nth-child(1) > #divContainer > .sm-image > #imgPicture').click();
    cy.get('.ui-datepicker-trigger').click();
    // class="ui-datepicker-month"
    // class="ui-datepicker-year"
    // <a class="ui-state-default" href="#">10</a>
    const next_day = new Date(choice.nextSched);
    pickDate(next_day);
    cy.get('#btnContinue').click();
    cy.get('#ancSchListView').click();

    // return next_day; /////////

    cy.get('.tblSchslots tr').filter(`:contains("${choice.time}")`).filter(`:contains("${choice.resource}")`)
        .find('a')
        .click();
    cy.get('#btnContinue').click();
    cy.get('#btnAcceptWaiver').click();

    // cy.get('#ctl00_pageContentHolder_pnlOuterErrorMessage').should('not.exist');
    // ctl00_pageContentHolder_ctrlErrorControl_tblError
    // ctl00_pageContentHolder_gvMembers_ctl02_imgErrorMessage

    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="checkbox"]').check({ force: true });
    cy.get('.schedulerFamilyMembers tr').filter(`:contains("${choice.member}")`).find('[type="radio"]').check({ force: true });

    // Continue to Cart
    cy.get('#ctl00_pageContentHolder_btnContinueCart').click();
    // Success
    cy.get('#ctl00_pageContentHolder_lblThankYou').should('contain', 'Booked');

    return next_day;
}

export function bookGroupClass(choice) {
    cy.visit('/Home.aspx?isKiosk=False');

    // TODO: schedule type
    cy.get('#menu_GRX').click();
    cy.get('#radioCalendar').check({ force: true });
    // class="ui-datepicker-month"
    // class="ui-datepicker-year"
    // <a class="ui-state-default" href="#">10</a>
    const next_day = new Date(choice.nextSched);
    //Access minPrice here
    cy.get('#ctl00_pageContentHolder_ctrlFromDate_trshowCal > .ui-datepicker-trigger').click();
    pickDate(next_day);
    cy.get('#btnSearch').click();

    cy.get('#lstSchedules tr').filter(`:contains("${choice.resource}")`)
        .find('input')
        .click();

    // return next_day; /////////

    cy.get('#ctl00_pageContentHolder_pnlOuterErrorMessage').should('not.exist');

    cy.get('#ctl00_pageContentHolder_gvMembers tr').filter(`:contains("${choice.member}")`).find('[type="checkbox"]').check({ force: true });

    // Continue to Cart
    cy.get('#ctl00_pageContentHolder_btnContinueCart').click();
    // Success
    cy.get('#ctl00_pageContentHolder_rptScheduleConfirmation_ctl00_lblThankYou').should('contain', 'Booked');

    return next_day;
}


export default { login };

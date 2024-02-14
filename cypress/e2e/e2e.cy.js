/* eslint-disable no-undef */
describe('Testing Election Site', () => {
  beforeEach(() => {
    cy.session("Signup Session", () => {
      cy.visit("/signup")
      // cy.visit('/login');
      // cy.get("input[name='email']").type('org1@test.com');
      // cy.get("input[name='password']").type('testpassword');
      // cy.get("button[type='submit']").click();
      cy.get("input[name='firstName']").type('First');
      cy.get("input[name='lastName']").type('last');
      cy.get("input[name='email']").type('org1@test.com');
      cy.get("input[name='password']").type('testpassword');
      cy.get("button[type='submit']").click();
      cy.location().should((loc) => {
        expect(loc.pathname).to.eq("/elections");
      });
    })
  })

  // it('Sign up', () => {
  //   cy.visit('/signup');
  //   cy.get("input[name='firstName']").type('First');
  //   cy.get("input[name='lastName']").type('last');
  //   cy.get("input[name='email']").type('org1@test.com');
  //   cy.get("input[name='password']").type('testpassword');
  //   cy.get("button[type='submit']").click();
  //   cy.location().should((loc) => {
  //     expect(loc.pathname).to.eq("/elections");
  //   });
  // });

  // it('Login', () => {
  //   cy.visit('/signout');
  //   cy.visit('/login');
  //   cy.get("input[name='email']").type('org1@test.com');
  //   cy.get("input[name='password']").type('testpassword');
  //   cy.get("button[type='submit']").click();
  //   cy.location().should((loc) => {
  //     expect(loc.pathname).to.eq("/elections");
  //   });
  // });

  it('Create Election', () => {
    cy.visit('/elections');
    cy.get("input[name='title']").type('WD Election');
    cy.get("button[type='submit']").click();
    cy.contains("WD Election")
  });

  it('Manage Election', () => {
    cy.visit('/elections')
    cy.get("a").eq(4).click()
    cy.contains("Manage Voters")
    cy.contains("Manage Questions")
    cy.get('button[type="submit"]').then(($submitBtn) => {
      if ($submitBtn.length > 0) {
        cy.get("input[name='customURL']").type('wdpoll')
        cy.get("button[type='submit']").click();
      }
    })
  })
  
  it('Manage Voters', () => {
    cy.visit('/elections')
    cy.get("a").eq(4).click()
    cy.get('a').contains('Manage Voters').click()
    cy.get("input[name='voterId']").type('voter1');
    cy.get("input[name='password']").type('p1');
    cy.get("button[type='submit']").click();
    cy.get("input[name='voterId']").type('voter2');
    cy.get("input[name='password']").type('p2');
    cy.get("button[type='submit']").click();
    cy.contains("voter1")
    cy.contains("voter2")
  })

  it('Manage Questions', () => {
    cy.visit('/elections')
    cy.get("a").eq(4).click()
    cy.get('a').contains('Manage Questions').click()
    cy.get("button").click();
    cy.url().should("contain", "newQuestion")
    cy.get("input[name='title']").type('How is the WD401 Course?');
    cy.get("textarea[name='description']").type('Please select your experience about this course to give feedback');
    cy.get("input[name='option1']").type('Normal');
    cy.get("input[name='option2']").type('Interesting');
    cy.get("button[type='button']").eq(0).click();
    cy.get("input[name='option3']").type('Very Interesting');
    cy.get("button[type='submit']").click();
    cy.url().should('contain', "manageQuestions")
    cy.contains("Question added Successfully")
  })



});

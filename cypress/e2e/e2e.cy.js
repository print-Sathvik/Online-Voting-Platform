/* eslint-disable no-undef */
describe("Authentication Tests", () => {
  it('Sign up', () => {
    cy.visit('/signup');
    cy.get("input[name='firstName']").type('First');
    cy.get("input[name='lastName']").type('last');
    cy.get("input[name='email']").type('org1@test.com');
    cy.get("input[name='password']").type('testpassword');
    cy.get("button[type='submit']").click();
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/elections");
    });
  });

  it('Login', () => {
    cy.visit('/signout');
    cy.visit('/login');
    cy.get("input[name='email']").type('org1@test.com');
    cy.get("input[name='password']").type('testpassword');
    cy.get("button[type='submit']").click();
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/elections");
    });
  });
})

describe('Election Organizer Test Suite', () => {
  beforeEach(() => {
    cy.session("Login Session", () => {
      cy.visit('/login');
      cy.get("input[name='email']").type('org1@test.com');
      cy.get("input[name='password']").type('testpassword');
      cy.get("button[type='submit']").click();
      cy.location().should((loc) => {
        expect(loc.pathname).to.eq("/elections");
      });
    })
  })

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

  it('Start Election without Question', () => {
    cy.visit("/elections")
    cy.get("a").eq(5).click()
    cy.url().should('contain', "preview")
    cy.contains("Cannot start an election without any question")
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

  it('Start Election after adding question', () => {
    cy.visit("/elections")
    cy.get("a").eq(5).click()
    cy.url().should('contain', "preview")
    cy.get("button[type='submit']").click()
  })

  it('Signout', () => {
    cy.visit("/elections")
    cy.get("a").contains('Signout').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/");
    });
  })
});


describe('Voting Suite', () => {
  beforeEach(() => {
    cy.session("Voter Login Session", () => {
      cy.visit("/vote/election/wdpoll")
      cy.get("input[name='voterid']").type('voter1');
      cy.get("input[name='password']").type('p1');
      cy.get("button[type='submit']").click();
    })
  })

  it('Vote', () => {
    cy.visit("/vote/election/wdpoll")
    cy.contains("How is the WD401 Course?")
    cy.get("input[type='radio']").check("3")
    cy.get("button[type='submit']").click();
    cy.contains("You have already voted. Please wait for the result")
  })

  it('Same voter voting again', () => {
    cy.visit("/vote/election/wdpoll")
    cy.contains("You have already voted. Please wait for the result")
  })
})

describe("After Election", () => {
  beforeEach(() => {
    cy.session("Admin Signin after election", () => {
      cy.visit('/login');
      cy.get("input[name='email']").type('org1@test.com');
      cy.get("input[name='password']").type('testpassword');
      cy.get("button[type='submit']").click();
      cy.location().should((loc) => {
        expect(loc.pathname).to.eq("/elections");
      });
    })
  })

  it('Check Results', () => {
    cy.visit("/elections")
    cy.get("a").eq(5).click()
    cy.url().should('contain', "status/bar")
    cy.contains("Total Voters: 2")
    cy.contains("No of voters polled: 1")
    cy.contains("Voters remaining: 1")
  })

  it('End Election', () => {
    cy.visit('/elections')
    cy.get("button").eq(1).click()
    cy.contains("Ended")
  })
})
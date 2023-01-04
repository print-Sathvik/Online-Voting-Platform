"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("ElectionVoters", {
      fields: ["electionId"],
      type: "foreign key",
      name: "ElectionVoters_electionId_to_Elections",
      references: {
        table: "Elections",
        field: "id",
      },
    });

    await queryInterface.addConstraint("ElectionVoters", {
      fields: ["voterId"],
      type: "foreign key",
      name: "ElectionVoters_voterId_to_Voters",
      references: {
        table: "Voters",
        field: "id",
      },
    });

    await queryInterface.addConstraint("Voters", {
      fields: ["voterId"],
      type: "UNIQUE",
      name: "set_uniqueKey_in_Voters",
      references: {
        table: "Voters",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "ElectionVoters",
      "ElectionVoters_electionId_to_Elections"
    );
    await queryInterface.removeConstraint(
      "ElectionVoters",
      "ElectionVoters_voterId_to_Voters"
    );
    await queryInterface.removeConstraint("Voters", "set_uniqueKey_in_Voters");
  },
};

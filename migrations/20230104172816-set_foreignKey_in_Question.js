"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Questions", {
      fields: ["electionId"],
      type: "foreign key",
      name: "Questions_electionId_to_Elections",
      references: {
        table: "Elections",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "Questions",
      "Questions_electionId_to_Elections"
    );
  },
};

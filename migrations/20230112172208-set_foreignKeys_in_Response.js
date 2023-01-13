"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Responses", {
      fields: ["questionId"],
      type: "foreign key",
      name: "Responses_questionId_to_Questions",
      references: {
        table: "Questions",
        field: "id",
      },
    });

    await queryInterface.addConstraint("Responses", {
      fields: ["voterId"],
      type: "foreign key",
      name: "Responses_voterId_to_Voters",
      references: {
        table: "Voters",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "Responses",
      "Responses_questionId_to_Questions"
    );
    await queryInterface.removeConstraint(
      "Responses",
      "Responses_voterId_to_Voters"
    );
  },
};

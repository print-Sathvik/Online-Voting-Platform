"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ElectionVoter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ElectionVoter.belongsTo(models.Election, {
        foreignKey: "electionId",
      });

      ElectionVoter.belongsTo(models.Voter, {
        foreignKey: "voterId",
      });
    }

    static async getVoters(electionId) {
      const votersList = await ElectionVoter.findAll({
        where: {
          electionId,
        },
      });
      return votersList;
    }

    static async getVoter(electionId, voterId) {
      const voter = await ElectionVoter.findOne({
        where: {
          electionId,
          voterId,
        },
      });
      return voter;
    }
  }
  ElectionVoter.init(
    {
      electionId: DataTypes.INTEGER,
      voterId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ElectionVoter",
    }
  );
  return ElectionVoter;
};

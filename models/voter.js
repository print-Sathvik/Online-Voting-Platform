"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    static associate(models) {
      Voter.hasOne(models.ElectionVoter, {
        foreignKey: "voterId",
      });
    }

    static async getVoters(voterTableIds) {
      const voterIdsPK = new Array();
      for (let i = 0; i < voterTableIds.length; i++) {
        voterIdsPK.push(voterTableIds[i].voterId);
      }
      const votersList = await Voter.findAll({
        where: {
          id: {
            [Op.in]: voterIdsPK,
          },
        },
        order: [["id", "ASC"]],
      });
      return votersList;
    }
  }
  Voter.init(
    {
      voterId: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Voter",
    }
  );
  return Voter;
};

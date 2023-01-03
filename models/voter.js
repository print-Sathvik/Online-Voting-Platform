"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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

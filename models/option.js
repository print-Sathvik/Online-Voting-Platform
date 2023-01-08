"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      // define association here
      Option.belongsTo(models.Question, {
        foreignKey: "questionId",
      });
    }

    static getOptions(questionId) {
      return this.findAll({
        where: {
          questionId,
        },
        order: [["id", "ASC"]],
      });
    }

    static async remove(questionId) {
      return this.destroy({
        where: {
          questionId,
        },
      });
    }
  }
  Option.init(
    {
      option: DataTypes.STRING,
      questionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Response extends Model {
    static associate(models) {
      Response.hasMany(models.Voter, {
        foreignKey: "voterId",
      });
    }

    static async isResponded(questionId, voterId) {
      const anyResponse = await Response.findOne({
        where: {
          questionId,
          voterId,
        },
      });
      console.log(anyResponse);
      if (anyResponse != null) {
        return true;
      } else {
        return false;
      }
    }
  }
  Response.init(
    {
      questionId: DataTypes.BIGINT,
      voterId: DataTypes.BIGINT,
      optionId: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "Response",
    }
  );
  return Response;
};

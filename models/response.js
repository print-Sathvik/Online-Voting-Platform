"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Response extends Model {
    static associate(models) {}

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

    static async getOptionsCount(questionId, options) {
      let optionCount = new Array(options.length);
      for (let i = 0; i < options.length; i++) {
        optionCount[i] = await Response.count({
          where: {
            questionId: BigInt(questionId),
            optionId: BigInt(options[i].id),
          },
        });
      }
      return optionCount;
    }

    static async votedCount(questionId) {
      return await Response.count({
        where: {
          questionId,
        },
      });
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

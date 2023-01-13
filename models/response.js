"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Response extends Model {
    static associate(models) {
      Response.hasMany(models.Voter, {
        foreignKey: "voterId",
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

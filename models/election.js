"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Election.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
    }

    static async addElection({ title, started, ended, adminId }) {
      return await Election.create({
        title: title,
        started: false,
        ended: false,
        adminId,
      });
    }

    static getElections(adminId) {
      return this.findAll({
        where: {
          adminId,
        },
        order: [["id", "DESC"]],
      });
    }

    async changeStatus(id, started, ended) {
      ended = started ? (ended ? ended : true) : ended;
      started = started ? started : true;
      return await Election.update(
        { started, ended },
        {
          where: {
            id,
          },
        }
      );
    }

    static async remove(id, adminId) {
      return this.destroy({
        where: {
          id,
          adminId,
        },
      });
    }
  }
  Election.init(
    {
      title: DataTypes.STRING,
      started: DataTypes.BOOLEAN,
      ended: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    static associate(models) {
      // define association here
      Election.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });

      Election.hasMany(models.Question, {
        foreignKey: "electionId",
      });

      Election.hasMany(models.ElectionVoter, {
        foreignKey: "electionId",
      });
    }

    static async addElection({ title, started, ended, adminId }) {
      return await Election.create({
        title: title,
        started: started,
        ended: ended,
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

    static async addCustomURL(electionId, url) {
      const res = await Election.update(
        { customURL: url },
        {
          where: {
            id: electionId,
          },
        }
      );
      console.log(electionId, url, res);
      return res;
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

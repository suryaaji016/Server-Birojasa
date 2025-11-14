"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Partner extends Model {
    static associate(models) {
      Partner.hasMany(models.Partner, {
        as: "branches",
        foreignKey: "parentId",
      });
      Partner.belongsTo(models.Partner, {
        as: "parent",
        foreignKey: "parentId",
      });
    }
  }
  Partner.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isMain: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Partner",
    }
  );
  return Partner;
};

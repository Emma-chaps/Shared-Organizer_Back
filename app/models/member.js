const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Member extends Model {}

Member.init(
  {
    firstname: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    icon: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'member', timestamps: true },
);

module.exports = Member;

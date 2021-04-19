const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Widget extends Model {}

Widget.init(
  {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_nb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    range: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'widget', timestamps: true },
);

module.exports = Widget;

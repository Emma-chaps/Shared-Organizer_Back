const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Widget extends Model {}

Widget.init(
  {
    list_styles: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { sequelize, tableName: 'widget', timestamps: true },
);

module.exports = Widget;

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Widget extends Model {}

Widget.init(
  {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    list_style: {
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
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'widget', timestamps: true },
);

module.exports = Widget;

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Field extends Model {}

Field.init(
  {
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'field',
    timestamps: true,
  },
);

module.exports = Field;


import { Model, DataTypes } from "sequelize";
import sequelize from "../db";
import { User } from "./UserModels";

export class FileModel extends Model {
  declare id: number;
  declare userId: string;
  declare filename: string;
  declare extension: string;
  declare mimeType: string;
  declare size: number;
  declare path: string;
  declare uploadedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FileModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FileModel',
    tableName: 'files',
    timestamps: true,
  }
);

User.hasMany(FileModel, { foreignKey: 'userId' });
FileModel.belongsTo(User, { foreignKey: 'userId' });
import { Model, DataTypes } from "sequelize";
import sequelize from "../db";

export class User extends Model {
  declare id: number;
  declare password: string;
  declare email: string | null;
  declare phone: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export class Token extends Model {
  declare id: number;
  declare userId: string;
  declare refreshToken: string;
  declare deviceUUID: string;
  declare expiresAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceUUID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Token",
    tableName: "tokens",
    timestamps: true,
  }
);

User.hasMany(Token, { foreignKey: "userId", as: "tokens" });
Token.belongsTo(User, { foreignKey: "userId", as: "user" });

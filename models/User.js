const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define("User",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    }, 
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true
        }
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    role:{
        type: DataTypes.STRING,
        defaultValue: "customer"
    },
     isVerified:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    avatar:{
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},

    {
        tableName: "users",
        timestamps: true,
        indexes:[
            {fields: ["email"]},
            {fields: ["role"]}
        ],
        defaultScope: {
            attributes: {
                exclude: ["password"]
            }
        },
        scopes: {
            withPassword: {
               attributes: {
                 include: ["password"]
                }
            }
        }
    }
);
module.exports = User
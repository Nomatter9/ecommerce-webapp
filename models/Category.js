const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = sequelize.define("Category",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }, 
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
   
    image:{
        type: DataTypes.STRING(500),
        allowNull: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "categories",
            key: "id"
        }
    },
     sortOrder: {
        type: DataTypes.INTEGER,
        default: 0,
    },
},

    {
        tableName: "categories",
        timestamps: true,
        indexes:[
            {fields: ["slug"]},
            {fields: ["parentId"]}
        ],
    }
);
module.exports = Category
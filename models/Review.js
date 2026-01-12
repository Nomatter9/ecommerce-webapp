module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['productId'] },
      { fields: ['rating'] },
      { fields: ['isApproved'] },
      { unique: true, fields: ['userId', 'productId'] },
    ],
  });

  return Review;
};

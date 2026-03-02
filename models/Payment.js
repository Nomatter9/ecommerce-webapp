module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    paymentMethodType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'zar',
    },
    status: {
      type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded', 'cancelled'),
      defaultValue: 'pending',
    },
    stripeMetadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    cardBrand: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cardExpMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cardExpYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
  });

  return Payment;
};

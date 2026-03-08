module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentMethodId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'zar',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
    },
    captureMethod:      { type: DataTypes.STRING,  allowNull: true },
    confirmationMethod: { type: DataTypes.STRING,  allowNull: true },
    livemode:           { type: DataTypes.BOOLEAN, defaultValue: false },
    receiptEmail:       { type: DataTypes.STRING,  allowNull: true },
    description:        { type: DataTypes.STRING,  allowNull: true },
    metadata:           { type: DataTypes.TEXT,    allowNull: true },
    paidAt:             { type: DataTypes.DATE,    allowNull: true },
  }, {
    tableName: 'Payments',
    timestamps: true,
  });

  return Payment;
};
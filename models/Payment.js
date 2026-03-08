<<<<<<< HEAD
// models/Payment.js
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
=======
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
>>>>>>> 333a21fc14a022e72b08a3d5b336c2a532fa6499
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
<<<<<<< HEAD
      type: DataTypes.STRING(10),
=======
      type: DataTypes.STRING(3),
>>>>>>> 333a21fc14a022e72b08a3d5b336c2a532fa6499
      allowNull: false,
      defaultValue: 'zar',
    },
    status: {
<<<<<<< HEAD
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
    },
    captureMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    confirmationMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    livemode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    receiptEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'metadata',   
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }) 
  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    Payment.belongsTo(models.User,  { foreignKey: 'user_id',  as: 'user'  });
  };

  return Payment;
};
=======
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
>>>>>>> 333a21fc14a022e72b08a3d5b336c2a532fa6499

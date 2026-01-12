module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded'
      ),
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    shippingAddressSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Snapshot of address at time of order',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    paymentReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shippingCarrier: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['orderNumber'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
      { fields: ['createdAt'] },
    ],
  });

  return Order;
};

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
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
    label: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g., Home, Work, etc.',
    },
    recipientName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    suburb: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'South Africa',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM('shipping', 'billing', 'both'),
      defaultValue: 'both',
    },
  }, {
    tableName: 'addresses',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['isDefault'] },
    ],
  });

  return Address;
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      recipientName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      streetAddress: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      addressLine2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      suburb: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(100),
        defaultValue: 'South Africa',
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: Sequelize.ENUM('shipping', 'billing', 'both'),
        defaultValue: 'both',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('addresses', ['userId']);
    await queryInterface.addIndex('addresses', ['isDefault']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('addresses');
  },
};

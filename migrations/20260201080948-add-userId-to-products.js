'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Seller who created this product. NULL means admin-created product.',
    });

    // Add index for better query performance
    await queryInterface.addIndex('products', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', ['userId']);
    await queryInterface.removeColumn('products', 'userId');
  }
};

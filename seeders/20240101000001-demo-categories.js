'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Main categories
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        description: 'Computers, phones, TVs and more',
        parentId: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing, shoes and accessories',
        parentId: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Furniture, décor and garden supplies',
        parentId: null,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        parentId: null,
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: 'Beauty & Health',
        slug: 'beauty-health',
        description: 'Skincare, makeup and wellness products',
        parentId: null,
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Subcategories for Electronics
    await queryInterface.bulkInsert('categories', [
      {
        id: 6,
        name: 'Laptops',
        slug: 'laptops',
        description: 'Notebooks and laptops',
        parentId: 1,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        parentId: 1,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        name: 'TVs & Audio',
        slug: 'tvs-audio',
        description: 'Televisions and sound systems',
        parentId: 1,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Subcategories for Fashion
    await queryInterface.bulkInsert('categories', [
      {
        id: 9,
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Clothing for men',
        parentId: 2,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Clothing for women',
        parentId: 2,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        name: 'Shoes',
        slug: 'shoes',
        description: 'Footwear for all',
        parentId: 2,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};

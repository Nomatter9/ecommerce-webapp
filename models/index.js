const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Category = require('./Category')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.ProductImage = require('./ProductImage')(sequelize, Sequelize);
db.Cart = require('./Cart')(sequelize, Sequelize);
db.CartItem = require('./CartItem')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize);
db.Address = require('./Address')(sequelize, Sequelize);
db.Review = require('./Review')(sequelize, Sequelize);
db.Wishlist = require('./Wishlist')(sequelize, Sequelize);

// Define associations
// User associations
db.User.hasMany(db.Address, { foreignKey: 'userId', as: 'addresses' });
db.User.hasOne(db.Cart, { foreignKey: 'userId', as: 'cart' });
db.User.hasMany(db.Order, { foreignKey: 'userId', as: 'orders' });
db.User.hasMany(db.Review, { foreignKey: 'userId', as: 'reviews' });
db.User.hasMany(db.Wishlist, { foreignKey: 'userId', as: 'wishlist' });

// Category associations (self-referencing for subcategories)
db.Category.hasMany(db.Category, { foreignKey: 'parentId', as: 'subcategories' });
db.Category.belongsTo(db.Category, { foreignKey: 'parentId', as: 'parent' });
db.Category.hasMany(db.Product, { foreignKey: 'categoryId', as: 'products' });

// Product associations
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });
db.Product.hasMany(db.ProductImage, { foreignKey: 'productId', as: 'images' });
db.Product.hasMany(db.Review, { foreignKey: 'productId', as: 'reviews' });
db.Product.hasMany(db.CartItem, { foreignKey: 'productId' });
db.Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
db.Product.hasMany(db.Wishlist, { foreignKey: 'productId' });

// ProductImage associations
db.ProductImage.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Address associations
db.Address.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Cart associations
db.Cart.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Cart.hasMany(db.CartItem, { foreignKey: 'cartId', as: 'items' });

// CartItem associations
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cartId', as: 'cart' });
db.CartItem.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Order associations
db.Order.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Order.belongsTo(db.Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem associations
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Review associations
db.Review.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Review.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Wishlist associations
db.Wishlist.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Wishlist.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

module.exports = db;

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const config = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
sequelize.authenticate()
.then(()=> console.log("Sequelize connected successfully"))
.catch(err => console.log( "Sequelize connection error", err))
// Test database connection
db.query('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Products API is running okay',
    version: '2.0',
    endpoints: {
      auth: '/api/auth',
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users',usersRoutes);
app.use('/api/upload-profile-picture',usersProfileRoutes);
app.use('/api/comments',reactionsRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/posts', express.static('posts'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

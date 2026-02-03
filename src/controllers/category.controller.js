const { validationResult } = require('express-validator');
const slugify = require('slugify');
const db = require('../../models');
const Category = db.Category;
const Product = db.Product;

/**
 * Get all categories with optional filters
 * GET /api/categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { isActive, parentId, includeSubcategories } = req.query;

    // Build query conditions
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    // Build include for subcategories
    const include = [];
    if (includeSubcategories === 'true') {
      include.push({
        model: Category,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
      });
    }

    const categories = await Category.findAll({
      where,
      include,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      message: 'Categories retrieved successfully',
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

/**
 * Get category tree (hierarchical structure)
 * GET /api/categories/tree
 */
exports.getCategoryTree = async (req, res) => {
  try {
    const { isActive } = req.query;

    // Build where clause
    const where = { parentId: null };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Recursively include subcategories
    const buildCategoryTree = (isActiveFilter) => {
      const include = {
        model: Category,
        as: 'subcategories',
        required: false,
        order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      };

      if (isActiveFilter !== undefined) {
        include.where = { isActive: isActiveFilter };
      }

      // Nest subcategories up to 3 levels deep
      include.include = [{
        model: Category,
        as: 'subcategories',
        required: false,
      }];

      return include;
    };

    const categories = await Category.findAll({
      where,
      include: [buildCategoryTree(isActive === 'true' ? true : undefined)],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      message: 'Category tree retrieved successfully',
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ message: 'Failed to retrieve category tree' });
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
exports.getCategoryById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category retrieved successfully',
      category,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Failed to retrieve category' });
  }
};

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category retrieved successfully',
      category,
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Failed to retrieve category' });
  }
};

/**
 * Create new category
 * POST /api/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;

    // Generate slug if not provided
    const categorySlug = slug || slugify(name, { lower: true, strict: true });

    // Check if slug already exists
    const existingCategory = await Category.findOne({ where: { slug: categorySlug } });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this slug already exists' });
    }

    // Verify parent category exists if parentId is provided
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    // Create category
    const category = await Category.create({
      name,
      slug: categorySlug,
      description,
      image,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prevent category from being its own parent
    if (parentId && parseInt(parentId) === parseInt(id)) {
      return res.status(400).json({ message: 'Category cannot be its own parent' });
    }

    // If slug is being updated, check for uniqueness
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory) {
        return res.status(409).json({ message: 'Category with this slug already exists' });
      }
    }

    // If name is being updated and slug is not provided, regenerate slug
    let newSlug = slug;
    if (name && name !== category.name && !slug) {
      newSlug = slugify(name, { lower: true, strict: true });

      // Check if generated slug is unique
      const existingCategory = await Category.findOne({ where: { slug: newSlug } });
      if (existingCategory && existingCategory.id !== parseInt(id)) {
        // Append ID to make it unique
        newSlug = `${newSlug}-${id}`;
      }
    }

    // Verify parent category exists if parentId is being updated
    if (parentId !== undefined && parentId !== null) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }

      // Prevent circular parent-child relationships
      let currentParent = parentCategory;
      while (currentParent.parentId) {
        if (currentParent.parentId === parseInt(id)) {
          return res.status(400).json({
            message: 'Cannot set parent: would create circular relationship'
          });
        }
        currentParent = await Category.findByPk(currentParent.parentId);
        if (!currentParent) break;
      }
    }

    // Update category
    await category.update({
      ...(name && { name }),
      ...(newSlug && { slug: newSlug }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(parentId !== undefined && { parentId: parentId === null ? null : parentId }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for subcategories
    
    const subcategoryCount = await Category.count({ where: { parentId: category.id } });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with subcategories. Delete or reassign subcategories first.',
      });
    }

    // Check for associated products
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${productCount} associated product(s). Reassign or delete products first.`,
      });
    }

    // Delete category
    await category.destroy();

    res.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

/**
 * Get products in a category
 * GET /api/categories/:id/products
 */
exports.getCategoryProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { includeSubcategories } = req.query;

    // Verify category exists
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let categoryIds = [id];

    // Include products from subcategories if requested
    if (includeSubcategories === 'true') {
      const subcategories = await Category.findAll({
        where: { parentId: id },
        attributes: ['id'],
      });
      categoryIds = [...categoryIds, ...subcategories.map(sub => sub.id)];
    }

    const products = await Product.findAll({
      where: {
        categoryId: categoryIds,
        isActive: true,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Products retrieved successfully',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

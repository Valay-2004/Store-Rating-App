const db = require('../config/database');

class Store {
  static async create(storeData) {
    const { name, email, address, owner_id = null } = storeData;
    
    const query = `
      INSERT INTO stores (name, email, address, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, email, address, owner_id, average_rating, total_ratings, created_at
    `;
    
    const result = await db.query(query, [name, email, address, owner_id]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, u.name as owner_name
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByOwnerId(ownerId) {
    const query = `
      SELECT * FROM stores 
      WHERE owner_id = $1
    `;
    
    const result = await db.query(query, [ownerId]);
    return result.rows[0];
  }

  static async findAll(filters = {}, sortBy = 'created_at', sortOrder = 'DESC') {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, 
             s.created_at, u.name as owner_name
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Apply filters
    if (filters.name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }

    if (filters.address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }

    if (filters.email) {
      paramCount++;
      query += ` AND s.email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }

    // Add sorting
    const validSortColumns = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async update(id, updateData) {
    const { name, email, address } = updateData;
    
    const query = `
      UPDATE stores 
      SET name = $1, email = $2, address = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, address, average_rating, total_ratings
    `;
    
    const result = await db.query(query, [name, email, address, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM stores WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_stores,
        AVG(average_rating) as overall_average_rating,
        COUNT(CASE WHEN total_ratings > 0 THEN 1 END) as stores_with_ratings
      FROM stores
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }

  static async getStoreRatings(storeId) {
    const query = `
      SELECT r.id, r.rating, r.created_at, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await db.query(query, [storeId]);
    return result.rows;
  }
}

module.exports = Store;

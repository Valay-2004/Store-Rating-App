const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, address, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password, address, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, address, role, created_at
    `;
    
    const result = await db.query(query, [name, email, hashedPassword, address, role]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, address, role, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}, sortBy = 'created_at', sortOrder = 'DESC') {
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE 
               WHEN u.role = 'store_owner' THEN s.average_rating 
               ELSE NULL 
             END as rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id AND u.role = 'store_owner'
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Apply filters
    if (filters.name) {
      paramCount++;
      query += ` AND u.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      paramCount++;
      query += ` AND u.email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      paramCount++;
      query += ` AND u.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(filters.role);
    }

    // Add sorting
    const validSortColumns = ['name', 'email', 'address', 'role', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY u.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, address, role
    `;
    
    const result = await db.query(query, [hashedPassword, id]);
    return result.rows;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as normal_users,
        COUNT(CASE WHEN role = 'store_owner' THEN 1 END) as store_owners
      FROM users
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = User;

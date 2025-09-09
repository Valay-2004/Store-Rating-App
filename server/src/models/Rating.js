const db = require('../config/database');

class Rating {
  static async create(ratingData) {
    const { user_id, store_id, rating } = ratingData;
    
    // Use ON CONFLICT to handle updates to existing ratings
    const query = `
      INSERT INTO ratings (user_id, store_id, rating, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET 
        rating = EXCLUDED.rating,
        updated_at = NOW()
      RETURNING id, user_id, store_id, rating, created_at, updated_at
    `;
    
    const result = await db.query(query, [user_id, store_id, rating]);
    return result.rows[0];
  }

  static async findByUserAndStore(userId, storeId) {
    const query = `
      SELECT * FROM ratings 
      WHERE user_id = $1 AND store_id = $2
    `;
    
    const result = await db.query(query, [userId, storeId]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.*, s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async findByStoreId(storeId) {
    const query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await db.query(query, [storeId]);
    return result.rows;
  }

  static async update(id, rating) {
    const query = `
      UPDATE ratings 
      SET rating = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_id, store_id, rating, updated_at
    `;
    
    const result = await db.query(query, [rating, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM ratings WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(DISTINCT user_id) as unique_raters,
        COUNT(DISTINCT store_id) as rated_stores
      FROM ratings
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }

  static async getUserStoreRatings(userId) {
    const query = `
      SELECT s.id, s.name, s.address, s.average_rating, r.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1
      ORDER BY s.name ASC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Rating;

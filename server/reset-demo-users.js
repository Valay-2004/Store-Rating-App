const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

async function resetDemoUsers() {
  try {
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update all demo users with the correct password hash
    await db.query(
      'UPDATE users SET password = $1 WHERE email IN ($2, $3, $4)',
      [hashedPassword, 'admin@example.com', 'john@example.com', 'owner@techstore.com']
    );
    
    console.log('✅ Demo user passwords reset successfully');
    console.log('All demo accounts now use password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting demo users:', error);
    process.exit(1);
  }
}

resetDemoUsers();

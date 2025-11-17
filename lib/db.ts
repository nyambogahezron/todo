import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from '@/db/schema';
import { runMigrations } from '@/db/migrations';

// Singleton database instance
let db: ReturnType<typeof drizzle> | null = null;
let sqliteDb: ReturnType<typeof openDatabaseSync> | null = null;

// Initialize the database
export const initializeDatabase = async () => {
  try {
    if (!sqliteDb) {
      // Open SQLite database
      sqliteDb = openDatabaseSync('app.db');
      
      // Create Drizzle ORM instance
      db = drizzle(sqliteDb, { schema });
      
      // Run migrations to create tables
      await runMigrations(sqliteDb);
      
      console.log('✅ Database initialized successfully');
    }
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Get the database instance (must be initialized first)
export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Cleanup function
export const disconnectDatabase = async (): Promise<void> => {
  if (sqliteDb) {
    try {
      sqliteDb.closeSync();
      sqliteDb = null;
      db = null;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnect error:', error);
      throw error;
    }
  }
};

// Export database for direct use
export { db };


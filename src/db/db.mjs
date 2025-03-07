import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test'
};

export async function getConnection() {
    try {
        return await mysql.createConnection(dbConfig);
    } catch (error) {
        process.exit(1);
    }
}
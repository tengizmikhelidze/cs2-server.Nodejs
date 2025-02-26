import app from './app.mjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test'
};

// Connect to MySQL
async function connectDB() {
    try {
        return await mysql.createConnection(dbConfig);
    } catch (error) {
        process.exit(1);
    }
}

connectDB();

// Start Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

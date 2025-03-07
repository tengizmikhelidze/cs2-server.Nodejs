import { getConnection } from '../db/db.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
    const { email, password } = req.body;

    const connection = await getConnection();

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Error creating user' });
    } finally {
        await connection.end();
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    const connection = await getConnection();

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        return res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Error processing request' });
    } finally {
        await connection.end();
    }
}

// Get all users (excluding sensitive fields)
export async function getAllUsers(req, res) {
    const connection = await getConnection();

    try {
        // Retrieve only the id, email, and created_at fields
        const [rows] = await connection.execute(
            'SELECT id, email, created_at FROM users'
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Error fetching users' });
    } finally {
        await connection.end();
    }
}
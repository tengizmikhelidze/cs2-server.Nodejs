import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Node.js App!');
});

// Sample API endpoint
app.get('/data', (req, res) => {
    res.json({ message: 'This is data from the API' });
});

export default app;

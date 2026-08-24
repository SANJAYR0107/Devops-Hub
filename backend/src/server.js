const express = require('express');
const cors = require('cors');
const repositoryRoutes = require('./routes/repository');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/repository', repositoryRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`[INFO] DevOpsHub Backend running on port ${PORT}`);
});

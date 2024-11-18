const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const drfRoute = require('./routes/drfRoute.js');

const app = express();

// global middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// cors middleware
app.use(
    cors({
        origin: 'https://drf-tool.vercel.app', // Allow requests only from this URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods (optional)
        credentials: true, // Allow cookies (optional, if needed)
    })
);

// logging middleware
app.use(morgan("tiny"));

// testing route
app.get('/', (req, res) => {
    res.status(200).json({ status: true, message: "DRF IS RUNNING LIKE BOLT" });
});

// routing middlewares
app.use('/api/v1', drfRoute);

module.exports = app;

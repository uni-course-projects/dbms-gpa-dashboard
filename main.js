const express = require('express');
const app = express();
const path = require('path');
const routes = require('./route/routes');

// Middleware

app.use(express.json()); // parse JSON bodies


app.use(express.urlencoded({ extended: true }));

//serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

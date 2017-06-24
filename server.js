const express = require('express');

const app = express();

app.use(express.static('htdocs'));

app.listen(process.env.PORT);

const express = require('express');

const app = express();

app.use(express.static('docs'));

app.listen(process.env.PORT);

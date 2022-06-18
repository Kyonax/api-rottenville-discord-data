const Exe = require('../tools/functions')
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname + "public"))

app.listen(PORT, () => {
    console.log(`Let's Go!! http://localhost:${PORT}`)
});

/**
app.get('/', async (req, res) => {
    let json = await Exe.readJSON("./data/Members.json")
    res.send(JSON.parse(json).data)
}) */
const app = require('express')();
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Let's Go!! http://localhost:${PORT}`)
});


app.get('/', (req, res) => {    
    res.send("Re Testing")
})
const PORT = 7002
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser')


const app = express();

app.set('view engine', 'ejs');

app.use("/pictures",express.static("Pictures"))
app.use(express.json());
app.use("/public", express.static("Assets"));
app.use(express.urlencoded({ extended: false }));

app.use("", require('./router/router'))

app.listen(PORT, ()=>{
    console.log(`app listening to http://localhost:${PORT}`);
})
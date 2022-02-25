var express = require('express');

var app = express();

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', function(req, res) {
    const sendedCode = req.body.code
    const rightCode = process.env.CODE
    if (sendedCode === rightCode) {
        res.sendFile(__dirname + '/views/app.html');
    } else {
        res.send('Ingresaste el código incorrecto')
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
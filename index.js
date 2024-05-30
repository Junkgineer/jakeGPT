#!/home/jake/.nvm/versions/node/v16.15.1/bin/node
const express = require("express");
const app = express();
const path = require('path')

var ip = '0.0.0.0'
//var ip = '192.168.0.110'
var pid = 0

app.use(express.static(path.join(__dirname, 'public_html')));

app.use((req, res) => {
    res.status(404);
    res.send('<h1>Error 404: Page not found!</h1>')
})

var server = app.listen(process.env.PORT || 2046, ip, function () {
    var port = server.address().port;
    var current_ip = server.address().address;

console.log("JakeGPT now running on", current_ip +':'+port);
if (process.pid) {
    pid = process.pid
    process.title = 'jakegpt'
    console.log('PID: ' + process.pid, 'TITLE: ' + process.title);
  }
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing JAKEGPT server...');
    server.close(() => {
        console.log('JAKEGPT server closed.');
        console.log('Exiting JAKEGPT.');
        process.exit(0);
    });
});
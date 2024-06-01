#!/home/jake/.nvm/versions/node/v16.15.1/bin/node
require('dotenv').config()
const express = require("express");
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const path = require('path')
const OpenAI = require('openai');

const TESTMODE = true;

const openai = new OpenAI();
let assistant;

async function setupAssistant() {
    let assistants = await openai.beta.assistants.list();
    let assistant = assistants.data.find(assistant => assistant.id == process.env.ASST_ID);
}
if (!TESTMODE) setupAssistant();

const socketserver = new WebSocket.Server({ server: server });

socketserver.on('connection', async function connection(ws) {
    console.log('A new client connected.');
    ws.send('STR');
    ws.send("Welcome to JakeGPT! I'm here to assist with any questions you make have about Jake's professional qualifications, so ask away!");

    var thread;
    if (!TESTMODE) {
        thread = await openai.beta.threads.create();
        console.log(`Thread Created: ${thread.id}`)
    }

    ws.on('message', async function incoming(msg) {
        console.log('Received: %s', msg);

        if (!TESTMODE) {
            const message = await openai.beta.threads.messages.create(
                thread.id,
                {
                    role: "user",
                    content: `${msg}`
                }
            );
            console.log(`Message Created: ${message.id}`)

            socketserver.clients.forEach(async (client) => {
                client.send('STR');
                const run = openai.beta.threads.runs.createAndStream(thread.id, {assistant_id: process.env.ASST_ID})
                    .on('textDelta', (textDelta) => client.send(textDelta.value));
                const result = await run.finalRun();
            });
        } else {
            let stop;
            setTimeout(() => {
                clearTimeout(stop);
            }, 1000)
            ws.send('STR');
            stop = setInterval(() => {
                ws.send('Lorem ipsum dolor sit amet. ')
            }, 10)
        }
    });
});

app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/', async (req, res) => {
    res.render(path.join(__dirname, 'public_html', 'index.html'))
})

server.listen(process.env.PORT, process.env.SERVER_IP, function () {
    console.log("JakeGPT now running on", server.address().address + ':' + server.address().port);
    if (process.pid) {
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
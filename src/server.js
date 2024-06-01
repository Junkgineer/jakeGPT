#!/home/jake/.nvm/versions/node/v16.15.1/bin/node
require('dotenv').config()
const express = require("express");
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const path = require('path')
const OpenAI = require('openai');

// While in test mode, the app doesn't hit the OpenAI API at all, and instead streams Lorum Ipsum.
const TESTMODE = true;

const openai = new OpenAI();
let assistant;

async function setupAssistant() {
    // Retrieve the assistant we already created usign the OpenAI Assistant UI (https://platform.openai.com/assistants/)
    let assistants = await openai.beta.assistants.list();
    let assistant = assistants.data.find(assistant => assistant.id == process.env.ASST_ID);
}
if (!TESTMODE) setupAssistant();

const socketserver = new WebSocket.Server({ server: server });

// Setup the WebSocket server for chat functionality.
socketserver.on('connection', async function connection(ws) {
    console.log('A new client connected.');
    ws.send('STR');
    ws.send(`Welcome to ${process.env.FIRST_NAME}GPT! I'm here to assist with any questions you make have about ${process.env.FIRST_NAME}'s professional qualifications, so ask away!`);

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

// Setup Express webserver for the chat page.
app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/', async (req, res) => {
    res.render(path.join(__dirname, 'public_html', 'index.html'))
})

server.listen(process.env.PORT, process.env.SERVER_IP, function () {
    console.log(`${process.env.FIRST_NAME}GPT now running on`, server.address().address + ':' + server.address().port);
    if (process.pid) {
        process.title = `${process.env.FIRST_NAME.toLowerCase()}gpt`
        console.log('PID: ' + process.pid, 'TITLE: ' + process.title);
    }
});

// Make it so we exit gracefully.
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log(`Closing ${process.env.FIRST_NAME}GPT server...`);
    server.close(() => {
        console.log(`${process.env.FIRST_NAME}GPT server closed`);
        console.log(`Exiting ${process.env.FIRST_NAME}GPT.`);
        process.exit(0);
    });
});
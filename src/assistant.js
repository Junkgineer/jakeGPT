// var https = require('follow-redirects').https;
// var request = require('request');
const fs = require('fs')
const OpenAI = require('openai');
// const { runInNewContext } = require('vm');
// import OpenAI from "openai";

module.exports = class Assistant {
    ID = process.env.ASST_ID;
    ThreadID = '';
    #headers = new Headers();
    constructor() {
        this.#headers.append("Authorization", process.env.OPENAI_API_KEY);
        this.#headers.append("OpenAI-Beta", "assistants=v2");
        this.LoadSessionData();
    }
    SaveSessionData() {
        const data = JSON.stringify(
            {
                'assistantID': this.ID,
                'threadID': this.ThreadID
            }
        );
        fs.writeFile(process.env.DATA_FILE, data, err => {
            if (err) {
                throw err;
            } else {
                console.log("Data saved")
            }
        });
    }
    async LoadSessionData() {
        fs.readFile(process.env.DATA_FILE, (err, data) => {
            if (err) {
                throw err;
            } else {
                const ids = JSON.parse(data);
                this.ID = ids.assistantID;
                this.ThreadID = ids.threadID;
                console.log(`LOAD Assistant ID: ${this.ID}`);
                console.log(`LOAD thread ID: ${this.ThreadID}`);
                return this.ThreadID;
            }
        })
    }
    async CreateMessage(text) {
        console.log(`CREATE Message: ${text}`)
        console.log(`on thread ID: ${this.ThreadID}`)
        const openai = new OpenAI();
        const response = await openai.beta.threads.messages.create(
            this.ThreadID,
            {"role": "user", "content": `${text}`}
        )
        console.log(response);
    }
    async CreateRun() {
        const openai = new OpenAI();
        const run = await openai.beta.threads.runs.create(
            this.ThreadID,
            { assistant_id: `${this.ID}` }
          );
        
          console.log(run);
    }
    async ListMessages() {
        const openai = new OpenAI();
        const threadMessages = await openai.beta.threads.messages.list(
            this.ThreadID
          );
        
          console.log(threadMessages.data);
    }
    async DeleteThread() {
        console.log(`DELETE thread ID: ${this.ThreadID}`);
        const openai = new OpenAI();
        const response = await openai.beta.threads.del(this.ThreadID);
        console.log(response);
        return this.ThreadID;
    }
    async CreateThread() {
        const openai = new OpenAI();
        const emptyThread = await openai.beta.threads.create();
        this.ThreadID = emptyThread.id;
        console.log(`CREATE thread ID: ${this.ThreadID}`)
        this.SaveSessionData();
        return this.ThreadID;
    }
    async CreateThreadAndRun(msg) {
        const openai = new OpenAI();
        const threadandrun = await openai.beta.threads.createAndRun({
            thread: {
                messages: [
                  { role: "user", content: msg },
                ],
              },
        });
        this.ThreadID = threadandrun.thread_id;
        console.log(`CREATE thread ID: ${this.ThreadID}`)
        return this.ThreadID;
    }    
}
# JakeGPT - A ChatGPT based Resume' ChatBot

JakeGPT utilizes an [OpenAI Assistant](https://platform.openai.com/assistants/) and it's associated API to create a (very) simple Node.JS web app that can answer questions about my professional experience. To round out the conversations, it also includes some biographical data, as well as hobbies and interests.

When setting it up for your resume', I highly recommend giving it a more verbose resume' to work with, along with any anecdotes you'd like to possibly share. There's no reason to limit yourself. Think of the chatbot as giving a pre-interview; what would you
like it to say?

As a side note I *highly* recommend you **use ChatGPT-4o as the model to run your Assistant when in production**. In testing, GPT-3.5-turbo hallucinated extensively, saying I graduated from universities I did not, etc. I found that GPT-4o,
however, did an excellent job. Having said that, please keep in mind that this, like any AI implementation, can make mistakes!

## To Use
1. Create an [OpenAI Assistant](https://platform.openai.com/assistants/), and provide it with the necessary documents (such as your resume' and any other data you wish it to reference).
2. Edit `example_env` with your OpenAI API key, the Assistant ID, and other information. Save it as `.env`.
3. Set the IP address in index.html to the same IP address you use in the .env file.
4. There is a variable after the imports in `server.js` that allows for testing the code WITHOUT using any OpenAI API calls. It is set by default to `true`. Simply change `const TESTMODE = true;` to `const TESTMODE = false;` to start using the app normally.
5. Unless your name just happens to be Jake as well, edit the frontend text in the HTML to personalize your instance.
6. Run `node src/server.js` to start the server, and browse to the IP given to start chatting!

## App Details
* This app uses Node.js [WebSocket](https://www.npmjs.com/package/websocket) to communicate between the frontend and the backend instead of standard HTTP API calls. WebSocket handles the streaming text much more easily, and allows for a very clean and easy setup.
* In order for the frontend to properly format the streaming events, the server will send a "STR" to indicate a new message is beginning. This allows the client side JavaScript to properly stuff an element with the incoming text instead of creating a
    new one for each token sent.
* There are example questions that you can send to the model directly above the chat input that is similar to OpenAI's ChatGPT app. This can help the user get started. Edit the content of them as desired.

#!/home/jake/.nvm/versions/node/v16.15.1/bin/node
require('dotenv').config()
const Assistant = require('./assistant')

async function main() {
    const assist = new Assistant();
    // assist.SaveSessionData();
    await assist.LoadSessionData()
        .then(r => {console.log(r)})
    
    // assist.CreateThread();
    // let del = await assist.DeleteThread();
    
}
main();

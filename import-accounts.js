const set = require('lodash.set');

let data = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("readable", () => {
    let chunk;
    while(chunk = process.stdin.read()) 
        data += chunk;
});

process.stdin.on('end', () => {
    let lines = data.trim().split("\n")
    let accounts = {};
    for(let line of lines) {
        set(accounts,line.replace(":","."), true);
    }
    console.log(JSON.stringify(accounts,null,2));
})
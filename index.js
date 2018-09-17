const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const fs = require('fs');
const get = require('lodash.get');
const set = require('lodash.set');
const bcrypt = require('bcrypt');

let app = express();

let pwHash = fs.readFileSync("data/passwd").toString("utf-8");

let auth = basicAuth({
    authorizer: (username, password, cb) => {
        if(username === "user") {
            bcrypt.compare(password, pwHash, cb);
        }
        else cb(null,false);
    },
    authorizeAsync: true,
    challenge: true
});

let jsonParser = bodyParser.json();

app.use(auth);
app.use("/", express.static("html"));

let api = new express.Router();

    api.get("/", (req, res) => {
        res.send("Hello from APIv0!");
    });

    api.get("/accounts", (req, res) => {
        fs.readFile("data/accounts.json", (err, txt) => {
            if(err) {
                console.log(err);
                res.status(500).send("Internal server error!");
            }
            else {
                // TODO join static accounts with new accounts since creation
                res.type('json');
                res.send(txt);
            }
        });
    });

    api.put("/record", jsonParser, (req, res) => {
        let record = req.body;
        if( typeof record === "object" && 
            record.description &&
            record.amount && 
            record.accountOne &&
            record.accountTwo ) {

                let data = `${ledgerDate()} ${record.description.replace(/\\s/g, " ")}
\t${record.accountOne}\t£${record.amount}
\t${record.accountTwo}\n`;
                fs.writeFile("data/records.dat", data, {flag: "a"}, (err) => {
                    if(err) {
                        console.log(err);
                        res.status(500).send("Internal filesystem error.")
                    }
                    else {
                        res.status(202).send("Record added")
                    }
                })

        }
        else {
            res.status(400).send("Body does not have all fields");
        }
    })

    api.put("/account", jsonParser, (req, res) => {
        let account = req.body;
        if ( typeof account === "object" && 
             account.name &&
             account.parent ) {
            fs.readFile("data/accounts.json", (err, data) => {
                if(err) {res.status(500).send("Internal filesystem error");}
                else {
                    let accounts = JSON.parse(data.toString("UTF-8"));
                    let path = account.parent.replace(".", "").replace(":", ".") + "."
                             + account.name.replace(/[\.:]/,"");
                    set(accounts, path, true);
                    fs.writeFile("data/accounts.json", JSON.stringify(accounts), (err1) => {
                        if(err1) {
                            res.status(500).send("Internal filesystem error");
                        }
                        else {
                            res.status(202).send(accounts);
                        }
                    })
                }
            })
        }
        else {
            res.status(400).send("Body does not have all fields");
        }
    })

    api.get("/auth.protected", (req,res) => {
        res.send("Auth is good!")
    })

function ledgerDate() {
    let now = new Date();
    return `${now.getFullYear()}/${now.getMonth()}/${now.getDate()}`
}

app.use("/api/v0", api);

app.listen(8000);
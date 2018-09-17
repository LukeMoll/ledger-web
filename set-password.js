const fs = require('fs');
const bcrypt = require('bcrypt');

bcrypt.hash(process.argv[2], 10, (err, hash) => {
    if(err) {
        console.log(err);
    }
    else {
        fs.writeFile("data/passwd", hash, (err1) => {
            if (err) console.log(err1);
        });
    }
})
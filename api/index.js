const request = require('request');
const express = require('express');
const admin = require("firebase-admin");
require('dotenv').config()

const ERROR_MESSAGE = 'Não foi possível obter os dados. Tente novamente mais tarde.'
const REMOVE_ERROR_MESSAGE = 'Não foi possível remover os dados. Tente novamente mais tarde.'
const NO_EXISTS_ERROR_MESSAGE = 'O item que está a tentar alterar não existe.'
const UPDATE_ERROR_MESSAGE = 'Não foi possível alterar os dados. Tente novamente mais tarde.'

const serviceAccount = JSON.parse(process.env.FIREBASE_OPTIONS)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

const app = express();
const PORT = process.env.PORT || 3000;

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    const allowedOrigins = [
        'http://127.0.0.1:5500', 
        'https://portulemicas.github.io', 
        'https://portulemicas.github.io/website/',
        'http://portulemicas.com',
        'https://portulemicas.com'
    ];
    const origin = req.header('Origin');

    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
    next();
  });

app.get('/', (req, res) => {
    res.status(200).send(
        "Portulémicas API - " +
        "Com esta API é possível adicionar, alterar e eliminar dados do ficheiro JSON que contém todos os dados " +
        "sobre polémicas políticas em portugal."
    )
})

/* GET */

app.get('/api/all', function (req, res) {
    db.ref('/').once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            value = {}
        }
        res.status(200).send(value);
    }, (e) => {
        res.status(500).send({"error": ERROR_MESSAGE})
    }); 
});

app.get('/api/all/:year', function (req, res) {
    const year = req.params.year
    db.ref(`/${year}`).once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            value = {}
        }
        res.status(200).send(value);
    }, (e) => {
        res.status(500).send({"error": ERROR_MESSAGE})
    }); 
});

app.get('/api/all/:year/:month', function (req, res) {
    const year = req.params.year
    const month = req.params.month
    db.ref(`/${year}/${month}`).once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            value = {}
        }
        res.status(200).send(value);
    }, (e) => {
        res.status(500).send({"error": ERROR_MESSAGE})
    }); 
});

app.get('/api/all/:year/:month/:day', function (req, res) {
    const year = req.params.year
    const month = req.params.month
    const day = req.params.day
    db.ref(`/${year}/${month}/${day}`).once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            value = {}
        }
        res.status(200).send(value);       
    }, (e) => {
        res.status(500).send({"error": ERROR_MESSAGE})
    }); 
});

/* PUT */

app.put('/api/update/status/:year/:month/:day/:key', function (req, res) {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;
    const key = req.params.key;

    let ref = db.ref(`/${year}/${month}/${day}/${key}`);
    ref.once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            return res.status(404).send({"error" : NO_EXISTS_ERROR_MESSAGE});
        }
        else {
            ref.update({"status": 1})
            .then(function() {
                value['status'] = 1
                res.status(202).send(value)
            })
            .catch(function(error) {
                res.status(500).send({"error": UPDATE_ERROR_MESSAGE})
            });
        }
    })
});

app.put('/api/update/archive/:year/:month/:day/:key', function (req, res) {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;
    const key = req.params.key;

    let ref = db.ref(`/${year}/${month}/${day}/${key}`);
    ref.once('value', (snapshot) => {
        var value = snapshot.val()
        if (!value) {
            return res.status(404).send({"error" : NO_EXISTS_ERROR_MESSAGE});
        }
        else {
            // make request to robustlinks.mementoweb api to archive the link
            // the field we want is data-versionurl
            request(
            `https://robustlinks.mementoweb.org/api/?url=${encodeURIComponent(value['url'])}`, 
            { json: true }, 
            (error, response, body) => {
                if (error) { 
                    return res.status(500).send({"error": ERROR_MESSAGE});
                }
                        
                try {
                    // re-execute the query to check if the value still exists
                    ref.once('value', (s) => {
                        value = s.val()
                        if (!value) {
                            return res.status(404).send({"error" : NO_EXISTS_ERROR_MESSAGE});
                        }
                        else {
                            ref.update({"archive": body['data-versionurl']})
                            .then(function() {
                                value['archive'] = body['data-versionurl']
                                res.status(202).send(value)
                            })
                            .catch(function(error) {
                                res.status(500).send({"error": UPDATE_ERROR_MESSAGE})
                            });
                        }
                    })
                }
                catch(e) {
                    return res.status(500).send({"error": ERROR_MESSAGE})
                }
            })
        }
    })
})

/* POST */
  
app.post('/api/create/:year/:month/:day', function (req, res) {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;

    const data = req.body

    request(
    `http://api.linkpreview.net/?key=${process.env.LINKPREVIEW_ACCESS_TOKEN}&q=${data.url}`, 
    { json: true }, 
    (error, response, body) => {
        if (error) { 
            return res.status(500).send({"error": ERROR_MESSAGE});
        }
        
        try {
            data['archive'] = ''
            data['status'] = 0
            data['title'] = body.title
            data['description'] = body.description
            data['image'] = body.image
            
            let ref = db.ref(`/${year}/${month}/${day}`);
            
            // should not post if there is a child with the same link
            // if exists, return it and a status of 200?
            ref.orderByChild('url').equalTo(data['url']).once('value', (snapshot) => {
                const value = snapshot.val();
                if (value) {
                    return res.status(403).send({"key": Object.keys(value)[0]})
                }
                else {
                    const newElem = ref.push()
                    newElem.set(data)
                    .then(function() {
                        return res.status(201).send({"data":data, "key": newElem.key})
                    })
                    .catch(function(error) {
                        return res.status(500).send({"error": ERROR_MESSAGE})
                    });
                }
            });
        }
        catch(e) {
            return res.status(500).send({"error": ERROR_MESSAGE})
        }
    });
});

/* DELETE */
  
app.delete('/api/delete/:year/:month/:day/:key', function (req, res) {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;
    const key = req.params.key;

    let ref = db.ref(`/${year}/${month}/${day}/${key}`);
    ref.remove()
    .then(function() {
        res.status(202).send({"message": "Item removed"})
    })
    .catch(function(error) {
        res.status(500).send({"error": REMOVE_ERROR_MESSAGE})
    });
});

/* Open server */

var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log("server listening at http://%s:%s", host, port);
});

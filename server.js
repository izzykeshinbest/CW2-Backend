const express = require('express');
var app = express();
const path = require("path");
const fs = require("fs"); 
var cors = require('cors');

//APPLICATION MIDDLEWARES
app.use(cors())
app.use(express.json());

//logger middleware(outputs requests to the server console)
app.use(function (req, res, next) {
    console.log("Request URL: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});

//static middleware that returns lesson image
app.use(function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, 'static', req.url);
    // Built-in fs.stat gets info about a file
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});



const {MongoClient} = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
 let db;
let mongoUrl = "mongodb+srv://DAyesoro:daniel123@cluster0.gc9cp.mongodb.net/CST3145?retryWrites=true&w=majority"


MongoClient.connect(mongoUrl, (err, client) => {
    if(!err){
        db = client.db('CST3145');
        console.log('successful bitch')
    }
    
});


app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next()
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages');
});


app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        console.log(results.ops);
        res.send(results.ops)
    })
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        })
})

app.get('/collection/:collectionName/:query', (req, res, next) => {

const query = {"$or": [
    {'subject': {'$regex': req.params.query, '$options': 'i'}},
    {'location': {'$regex': req.params.query, '$options': 'i'}}
]};

   
req.collection.find(query).toArray((e, results) => {
        if (e) return next(e)
        console.log(results);
        res.send(results)
    })
});

app.use(function (req, res) {
    // Sets the status code to 404
    res.status(404);
    // Sends the error "File not found!”
    res.send("File not found!");
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("App is listening on port 3000");
});
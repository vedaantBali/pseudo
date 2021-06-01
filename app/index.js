// interface for clients, API


// declarations required for creating a p2p server
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');

// default port declaration
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const p2pServer = new P2pServer(blockchain);

app.use(bodyParser.json());

// blocks end point request for the blockchain - are responded with chain
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});


// mining end point - data added to chain
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added ${block.toString}`);

    p2pServer.syncChains();

    res.redirect('/blocks');
});

// listening dialog
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

// start listening service
p2pServer.listen();
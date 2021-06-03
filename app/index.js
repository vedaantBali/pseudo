// interface for clients, API


// declarations required for creating a p2p server
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

// default port declaration
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockchain, transactionPool);
const miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

app.use(bodyParser.json());

// blocks end point request for the blockchain - are responded with chain
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});


// mining end point - data added to chain
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added ${block.toString()}`);

    p2pServer.syncChains();

    res.redirect('/blocks');
});

// transactions end point - get all transactions
app.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions);
});

// post request to transact with transactionpool
app.post('/transact', (req, res) => {
    const { receiver, amount } = req.body;
    const transaction = wallet.createTransaction(receiver, amount, blockchain, transactionPool);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
});

// get end point for exposing public keys
app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

// listening dialog
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

// start listening service
p2pServer.listen();
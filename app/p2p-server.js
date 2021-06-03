// exposes websocket to listen for connections
const Websocket = require('ws');

//declarations and initializations
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};
// server
class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    // sets up local server on localhost default port 5001 or user defined port
    listen() {
        const server = new Websocket.Server({
            port: P2P_PORT
        });
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening for peers on port ${P2P_PORT}`);
    }

    // open socket for clients to connect
    connectToPeers() {
        peers.forEach(peer => {
            /// ws://localhost:5001
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }
 
    // on client connections
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected.');
        
        this.messageHandler(socket);

        this.sendChain(socket);
    }

    // 1. update chain 2. update transaction 3. clear transaction
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);

            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
            }
            
        });
    }

    // methods to update/sync or send transactions
    sendChain(socket) {
        socket.send(JSON.stringify({ 
            type: MESSAGE_TYPES.chain, 
            chain: this.blockchain.chain 
        }));
    }

    syncChains() {
        this.sockets.forEach(socket => 
            this.sendChain(socket));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction    
        }));
    }

    // broadcast new transactions to all clients to mine
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => 
            this.sendTransaction(socket, transaction));
    }

    // broadcast to all clients that all transactions are verified
    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
}

module.exports = P2pServer;
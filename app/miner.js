// miner class declaration
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    // takes care of miner's functionality
    mine() {
        // holds current transaction pool of valid transactions
        const validTransactions = this.transactionPool.validTransactions();
        
        // add $MINE_REWARD to valid transacations
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );

        // update blockchain to add valid transactions
        const block = this.blockchain.addBlock(validTransactions);
        
        // sync all miners chains to have updated transaction pool
        this.p2pServer.syncChains();
        
        // clear pool after mining is done
        this.transactionPool.clear();

        // broadcast to all miners to update cleared transactions
        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}

module.exports = Miner;
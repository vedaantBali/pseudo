// class declaration for the wallet - end point
const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    // returns string format of a wallet instance
    toString() {
        return `Wallet - 
            public key: ${this.publicKey.toString()}
            balance   : ${this.balance}`;
    }

    // method to sign a dataHash using sign algorithm from elliptic
    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    // method to validate an input and create or update a transaction
    createTransaction(receiver, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);

        if(amount > this.balance) {
            console.log(`Amount ${amount} exceeds wallet balance ${this.balance}`);
            return ;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if(transaction) {
            transaction.update(this, receiver, amount);
        } else {
            transaction = Transaction.newTransaction(this, receiver, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }


    // method to calculate remaining balance in a wallet instance after making a transaction
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];

        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));

        const walletInputTransactions = transactions
            .filter(transaction => transaction.input.address === this.publicKey);
        
        let startTime = 0;

        if(walletInputTransactions.length > 0) {
            const recentInputTransactions = walletInputTransactions.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ?
                    prev : current
            );

            balance = recentInputTransactions.outputs
                .find(output => output.address === this.publicKey).amount;
            startTime = recentInputTransactions.input.timestamp;
        }        

        transactions.forEach(transaction => {
            if(transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if(output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;
    }

    // BLOCKCHAIN WALLET DECLARATION
    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }

}

module.exports = Wallet;
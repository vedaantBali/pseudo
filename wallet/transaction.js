// class declaration for a transaction (model)
const Wallet = require(".");
const ChainUtil = require("../chain-util");
const { MINE_REWARD } = require("../config");


class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = []; 
    }

    // update a transaction
    update(senderWallet, receiver, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if(amount > senderOutput.amount) {
            console.log(`Amount ${amount} exceeds wallet balance.`);
            return ;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: receiver });
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    // signs and updates the transactions
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();

        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    // method to create a new transaction after wallet validation
    static newTransaction(senderWallet, receiver, amount) {

        if(amount > senderWallet.balance) {
            console.log(`Amount ${amount} exceeds wallet balance ${senderWallet.balance} PC.`);
            return ;
        }

        return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: receiver }
        ]);
    }

    // reward miner with MINE_REWARD with wallet instance of minerWallet.publicKey
    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINE_REWARD,
            address: minerWallet.publicKey
        }]);
    }

    // method to sign a transaction to be added to the transaction variable
    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    // verify transactions
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        )
    }

}

module.exports = Transaction;
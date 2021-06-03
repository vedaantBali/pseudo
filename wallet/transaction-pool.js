// transaction pool class
// holds all current unvalidated transaction
// transaction pool is cleared after validation
const Transaction = require("./transaction");

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    // if transaction exists, update, else add new into transactions
    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);
        
        if(transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    // returns the transactions belonging to address
    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    // returns valid transaction from transactions
    validTransactions() {
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            if(transaction.input.amount !== outputTotal) {
                console.log(`invalid transaction from ${transaction.input.address}.`);
                return ;
            }

            if(!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return ;
            }

            return transaction;
        });
    }

    // method to clear transaction pool
    clear() {
        this.transactions = [];
    }
}

module.exports = TransactionPool;
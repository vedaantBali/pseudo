const Wallet = require(".");
const Blockchain = require("../blockchain");
const Transaction = require("./transaction");
const TransactionPool = require("./transaction-pool");

describe('TransactionPool', () => {
    let transactionPool, wallet, transaction, blockchain;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        wallet = new Wallet();
        blockchain = new Blockchain();
        transaction = wallet.createTransaction('r4nd0m-4ddr355', 30, blockchain, transactionPool);
    });

    it('adds a transaction to the pool', () => {
        expect(transactionPool.transactions.find(t => t.id === transaction.id))
            .toEqual(transaction);
    });

    it('updates a transaction to the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'n3w-4ddr355', 40);
        transactionPool.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(transactionPool.transactions.find(t => t.id === newTransaction.id)))
            .not.toEqual(oldTransaction);

    });

    it('clears transactions', () => {
        transactionPool.clear();
        expect(transactionPool.transactions).toEqual([]);
    })

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...transactionPool.transactions];

            for(let i=0; i<6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('r4nd-4ddr355', 30, blockchain, transactionPool);
                if(i % 2 == 0) {
                    transaction.input.amount = 99999;
                } else {
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows distinction between valid and invalid transactions', () => {
            expect(JSON.stringify(transactionPool.transactions))
                .not.toEqual(JSON.stringify(validTransactions));
        });        

        it('grabs valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

    });
});

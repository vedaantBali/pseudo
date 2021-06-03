const Wallet = require(".");
const Blockchain = require("../blockchain");
const { INITIAL_BALANCE } = require("../config");
const TransactionPool = require("./transaction-pool");

describe('Wallet', () => {
    let wallet, transactionPool, blockchain;

    beforeEach(() => {
        wallet = new Wallet();
        transactionPool = new TransactionPool();
        blockchain = new Blockchain();
    });

    describe('creating a new transaction', () => {
        let transaction, sendAmount, receiver;

        beforeEach(() => {
            sendAmount = 50;
            receiver = 'r3c31v3r';
            transaction = wallet.createTransaction(receiver, sendAmount, blockchain, transactionPool);
        });

        describe('doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(receiver, sendAmount, blockchain, transactionPool);
            });

            it('doubles the `sendAmount` subtracted from the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2);
            });

            it('clones the `sendAmount` output for the receiver', () => {
                expect(transaction.outputs.filter(output => output.address === receiver)
                    .map(output => output.amount))
                        .toEqual([sendAmount, sendAmount]);
            });

        })
    });

    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            for(let i=0; i<repeatAdd; i++) {
                senderWallet
                    .createTransaction(wallet.publicKey, addBalance, blockchain, transactionPool);
            }
            blockchain.addBlock(transactionPool.transactions);
        });

        it('calculates the balance for blockchain transacations matching the receiver', () => {
            expect(wallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE + (addBalance*repeatAdd));
        });

        it('calculates the balance for the blockchain transactions matching the sender', () => {
            expect(senderWallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE - (addBalance*repeatAdd));
        });

        describe('the receiver conducts a transaction', () => {
            let subtractBalance, receiverBalance;

            beforeEach(() => {
                transactionPool.clear();
                subtractBalance = 60;
                receiverBalance = wallet.calculateBalance(blockchain);
                wallet
                    .createTransaction(senderWallet.publicKey, subtractBalance, blockchain, transactionPool);
                blockchain.addBlock(transactionPool.transactions);
            });

            describe('sender sends another transaction to the receiver', () => {

                beforeEach(() => {
                    transactionPool.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, blockchain, transactionPool);
                    blockchain.addBlock(transactionPool.transactions);
                });

                it('calculates the receiver balance only using transactions since most recent', () => {
                    expect(wallet.calculateBalance(blockchain)).toEqual(receiverBalance - subtractBalance + addBalance);
                });

            });
        });
    });

});
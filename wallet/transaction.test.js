// test cases for the transaction 
const Transaction = require("./transaction");
const Wallet = require("./index");
const { MINE_REWARD } = require("../config");

describe('Transaction', () => {
    let transaction, wallet, receiver, amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        receiver = 'r3c1ev3r';
        transaction = Transaction.newTransaction(wallet, receiver, amount);
    });

    it('outputs the `amount` subtracted from wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount);
    });

    it('outputs amount added to receiver', () => {
        expect(transaction.outputs.find(output => output.address === receiver).amount)
        .toEqual(amount); 
    });
    
    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates a valid transaction', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidates a corrupt transaction', () => {
        transaction.outputs[0].amount = 50000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    })

    describe('transaction amount exceeds balance', () => {
        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, receiver, amount);
        });

        it('does not create the transaction', () => {
            expect(transaction).toEqual(undefined);
        });

    });

    describe('updating a transaction', () => {
        let nextAmount, nextReceiver;
        beforeEach(() => {
            nextAmount = 20;
            nextReceiver = "n3xt-4ddr355";
            transaction = transaction.update(wallet, nextReceiver, nextAmount);
        });

        it('subtracts next amount from senders output', () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount);
        });

        it('outputs an amount for next receiver', () => {
            expect(transaction.outputs.find(output => output.address === nextReceiver).amount)
                .toEqual(nextAmount);
        });

    });

    describe('creating a reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it(`rewards the miner's wallet`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINE_REWARD);
        });

    });

});

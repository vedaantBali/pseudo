const Transaction = require("./transaction");
const Wallet = require("./index");

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

    describe('transaction amount exceeds balance', () => {
        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, receiver, amount);
        });

        it('does not create the transaction', () => {
            expect(transaction).toEqual(undefined);
        });

    });

});

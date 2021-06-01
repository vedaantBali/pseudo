// test cases for blockchain
const Blockchain = require("./index");
const PseudoBlock = require("./pseudo_block");

describe('Blockchain', () => {
    let bc, bc2;
    
    beforeEach(() => {
        bc = new Blockchain();
        bc2 = new Blockchain();
    });

    it('starts with Genesis block', () => {
        expect(bc.chain[0]).toEqual(PseudoBlock.genesis());
    });

    it('adds a new block', () => {
        const data = 'foo';
        bc.addBlock(data);

        expect(bc.chain[bc.chain.length-1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        bc2.addBlock('foo');

        expect(bc.isChainValid(bc2.chain)).toBe(true);

    });

    it('invalidates chain with corrupt genesis block', () => {
        bc2.chain[0].data = 'Bad Data';

        expect(bc.isChainValid(bc2.chain)).toBe(false);
    });

    it('invalidates a corrupt chain', () => {
        bc2.addBlock('foo');
        bc2.chain[1].data = 'not foo';

        expect(bc.isChainValid(bc2.chain)).toBe(false);
    });

    it('replaces chain with valid chain', () => {
        bc2.addBlock('goo');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('doesn\'t replace chain with smaller chain', () => {
        bc.addBlock('foo');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).not.toEqual(bc2.chain);
    })
});
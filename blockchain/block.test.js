const PseudoBlock = require("./pseudo_block");

describe('PseudoBlock', () => {
    let data, prevBlock, pseudoBlock;

    beforeEach(() => {
        data = 'bar';
        prevBlock = PseudoBlock.genesis();
        pseudoBlock = PseudoBlock.minePseudoBlock(prevBlock, data);
    });

    it('sets `data` to match the input', () => {
        expect(pseudoBlock.data).toEqual(data);
    });
    
    it('sets `prevHash` to match the hash of last block', () => {
        expect(pseudoBlock.prevHash).toEqual(prevBlock.hash);
    });

});
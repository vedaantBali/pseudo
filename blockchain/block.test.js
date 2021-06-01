// test cases for pseudo block
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

    it('generates a hash which matches difficulty', () => {
        expect(pseudoBlock.hash.substring(0, pseudoBlock.difficulty))
        .toEqual('0'.repeat(pseudoBlock.difficulty));

        // console.log(pseudoBlock.toString());
    });

    it('lowers difficulty for slower mined blocks', () => {
        expect(PseudoBlock.adjustDiff(pseudoBlock, pseudoBlock.timestamp+360000))
        .toEqual(pseudoBlock.difficulty-1);
    });

    it('raises the difficulty for quickly mined blocks', () => {
        expect(PseudoBlock.adjustDiff(pseudoBlock, pseudoBlock.timestamp+1))
        .toEqual(pseudoBlock.difficulty+1);
    })

});
const PseudoBlock = require('./blockchain/pseudo_block');

const newBlock = PseudoBlock.minePseudoBlock(PseudoBlock.genesis(), 'newBlock');
console.log(newBlock.toString());

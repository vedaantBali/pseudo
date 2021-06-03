// class declaration for the blockchain
const PseudoBlock = require("./pseudo_block");

class Blockchain {
    constructor() {
        this.chain = [PseudoBlock.genesis()];
    }

    // adds a block of transactions to current blockchain
    addBlock(data) {
        const pseudoBlock = PseudoBlock.minePseudoBlock(this.chain[this.chain.length-1], data);
        this.chain.push(pseudoBlock);

        return pseudoBlock;
    }

    // checks if the current blockchain is valid or not and returns boolean result
    isChainValid(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(PseudoBlock.genesis())) return false;
        for(let i = 1; i<chain.length; i++) {
            const block = chain[i];
            const prevBlock = chain[i-1];

            if(block.prevHash !== prevBlock.hash ||
                block.hash !== PseudoBlock.blockHash(block)){
                return false;
            }
        }
        return true;
    }

    // method to replace current chain with new blockchain
    replaceChain(newChain) {
        if(newChain.length < this.chain.length) {
            console.log('Received chain is shorter than current chain');
            return;
        } else if(!this.isChainValid(newChain)) {
            console.log('Received chain is not valid.');
            return;
        }
        console.log('Replacing blockchain');
        this.chain = newChain;
    }
}

module.exports = Blockchain;
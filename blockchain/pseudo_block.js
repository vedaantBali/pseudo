// class declaration for pseudo block
const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class PseudoBlock {
    constructor(timestamp, prevHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    // returns string format of each block
    toString() {
        return `Block - 
            Timestamp : ${this.timestamp}
            Prev Hash : ${this.prevHash.substring(0,10)}...
            Hash      : ${this.hash.substring(0, 10)}...
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}`;
    }

    // GENESIS DECLARATION
    // nAn timestamp, prevHash, hash, data, nonce, difficulty
    static genesis() {
        return new this('Genesis Timestamp', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
    }
    
    // method to mine a block, and adjust its difficulty by tuning nonce value
    static minePseudoBlock(prevBlock, data) {
        let hash, timestamp;
        const prevHash = prevBlock.hash;
        let { difficulty } = prevBlock;
        let nonce = 0;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = PseudoBlock.adjustDiff(prevBlock, timestamp);
            hash = PseudoBlock.hash(timestamp, prevHash, data, nonce, difficulty);
        } while(hash.substr(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, prevHash, hash, data, nonce, difficulty);
    }
    
    // returns 256 bit SHA256 hash which takes following arguments as input
    static hash(timestamp, prevHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${prevHash}${data}${nonce}${difficulty}`).toString();
    }

    // returns hash value of the block according to the parameters
    static blockHash(block) {
        const {timestamp, prevHash, data, nonce, difficulty} = block;
        return PseudoBlock.hash(timestamp, prevHash, data, nonce, difficulty);
    }

    // method to adjust the difficulty of mining 
    // if mine rate increases, difficulty is increased and vice versa
    static adjustDiff(prevBlock, currentTimestamp) {
        let { difficulty } = prevBlock;
        difficulty = prevBlock.timestamp + MINE_RATE > currentTimestamp ? 
            difficulty + 1 : difficulty - 1;
        return difficulty;
    }
}

module.exports = PseudoBlock;
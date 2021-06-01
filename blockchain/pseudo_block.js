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

    toString() {
        return `Block - 
            Timestamp : ${this.timestamp}
            Prev Hash : ${this.prevHash.substring(0,10)}...
            Hash      : ${this.hash.substring(0, 10)}...
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}`;
    }
    static genesis() {
        return new this('Genesis Timestamp', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
    }
    
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
    
    static hash(timestamp, prevHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${prevHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const {timestamp, prevHash, data, nonce, difficulty} = block;
        return PseudoBlock.hash(timestamp, prevHash, data, nonce, difficulty);
    }

    static adjustDiff(prevBlock, currentTimestamp) {
        let { difficulty } = prevBlock;
        difficulty = prevBlock.timestamp + MINE_RATE > currentTimestamp ? 
            difficulty + 1 : difficulty - 1;
        return difficulty;
    }
}

module.exports = PseudoBlock;
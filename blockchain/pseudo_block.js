const SHA256 = require('crypto-js/sha256');

class PseudoBlock {
    constructor(timestamp, prevHash, hash, data) {
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.hash = hash;
        this.data = data;
    }

    toString() {
        return `Block - 
            Timestamp: ${this.timestamp}
            Prev Hash: ${this.prevHash.substring(0,10)}
            Hash     : ${this.hash.substring(0, 10)}...
            Data     : ${this.data}`;
    }
    
    static genesis() {
        return new this('Genesis Timestamp', '-----', 'f1r57-h45h', []);
    }
    
    static minePseudoBlock(prevBlock, data) {
        const timestamp = Date.now();
        const prevHash = prevBlock.hash;
        const hash = PseudoBlock.hash(timestamp, prevHash, data);

        return new this(timestamp, prevHash, hash, data);
    }
    
    static hash(timestamp, prevHash, data) {
        return SHA256(`${timestamp}${prevHash}${data}`).toString();
    }

    static blockHash(block) {
        const {timestamp, prevHash, data} = block;
        return PseudoBlock.hash(timestamp, prevHash, data);
    }
}

module.exports = PseudoBlock;
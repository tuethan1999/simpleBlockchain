const crypto = require('crypto');
const hash = crypto.createHash('sha256');

class Transaction{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block{
	constructor(timestamp, data, previousHash = ''){
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();

		// this value is adjusted by miners to figure out the hash that starts with 0
		this.nonce = 0;
	}

	calculateHash(){
		return crypto.createHash('sha256').update(JSON.stringify(this.data) + this.timestamp + this.previousHash + this.nonce).digest('hex')
	}

	mineBlock(difficulty){
		while(this.hash.substring(0, difficulty) != "0".repeat(difficulty)){
			this.nonce++;
			this.hash = this.calculateHash()
		}
	}
}

class Blockchain{
	constructor(){
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGenesisBlock(){
		return new Block(Date.now(), "Genesis Block", "0");
	}

	getLatestBlock(){
		return this.chain[this.chain.length-1];
	}

	minePendingTransactions(miningRewardAddress){
		let block = new Block(Date.now(), this.pendingTransactions, this.chain[this.chain.length-1].hash);
		block.mineBlock(this.difficulty);
		this.chain.push(block);
		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		]
	}

	getBalanceOfAddress(address){
		let balance = 0;
		for(const block of this.chain){
			for(const transaction of block.data){
				balance -= transaction.fromAddress === address ? transaction.amount : 0;
				balance += transaction.toAddress === address ? transaction.amount : 0;
			}
		}
		return balance;
	}

	createTransaction(transaction){
		this.pendingTransactions.push(transaction);
	}

	isChainValid(){
		for(let i = 1; i < this.chain.length; i++){
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];

			if(currentBlock.hash != currentBlock.calculateHash()){
				return false;
			}
			if(currentBlock.previousHash != previousBlock.hash){
				return false;
			}
		}
		return true;
	}
}

let test = new Blockchain();

test.minePendingTransactions('publicKeyMiner1');
test.minePendingTransactions('publicKeyMiner1');


test.createTransaction(new Transaction('publicKeyMiner1', 'publicKeyMiner2', 20));
test.createTransaction(new Transaction('publicKeyMiner2', 'publicKeyMiner1', 10));
test.minePendingTransactions('publicKeyMiner1');
test.minePendingTransactions('publicKeyMiner2');
//console.log(test.chain)

console.log('Balance of publicKeyMiner1: ', test.getBalanceOfAddress('publicKeyMiner1'))
console.log('Balance of publicKeyMiner2: ', test.getBalanceOfAddress('publicKeyMiner2')) //hasn't been mined yet
console.log('Is chain valid: ', test.isChainValid())
console.log(test.chain)
/*console.log('Is chain valid: ', test.isChainValid())

test.chain[1].data = 'I CHANGED THIS';
console.log(test)
console.log('Is chain valid: ', test.isChainValid())*/


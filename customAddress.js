const { BigNumber } = require("ethers");
const { 
  keccak256, 
  arrayify, 
  getAddress: checksumAddress, 
  hexDataSlice,
  toUtf8Bytes, 
  hexZeroPad
} = require("ethers/lib/utils");
const { CURVE, Point } = require('@noble/secp256k1');

/**
 * @dev Prefix of your custom address
 * Have to start with 0x + 0-9 and/or a-f
 * Recommended length is 0x + 5-6 symbols or less,
 * otherwise it may take a lot of time to find an address
 */
const customPrefix = "0x0dad0";
console.log("customPrefix = ", customPrefix);

/**
 * @dev Custom seed 
 * If it takes a lot of time to find an address, change the seed
 */
const seed = "Monkey See, Monkey Do 🐵";
console.log("seed = ", seed);

let privateKeyFromSeed = BigNumber.from(keccak256(toUtf8Bytes(seed)));
let privateKey = arrayify(privateKeyFromSeed.mod(CURVE.n));
console.log("privateKey = ", privateKeyFromSeed.toHexString());

/**
 * @dev BigNumber deletes leading zeros,
 * which makes private key invalid
 */
if (privateKey.length < 32) {
  privateKey = arrayify(hexZeroPad(privateKey, 32));
}
let publicKey = Point.fromPrivateKey(privateKey);

/**
 * @dev For loop that will generate addresses
 */
for (let i = 1; ; ++i) {
  // Print i every millionth iteration
  if (i%1000000 === 0) {
    console.log("i = ", i/1000000);
  }

  // PK = PK + G
  publicKey = publicKey.add(Point.BASE);
  
  // Infer address from publicKey
  let getAddress = hexDataSlice(keccak256(
    hexDataSlice('0x' + publicKey.toHex(), 1)
  ), 12);

  // Check the address
  if (getAddress.startsWith(customPrefix)) {
    // Infer the private key of customAddress
    let getPrivateKey = BigNumber.from(privateKey).add(i);

    console.log("\ni = ", i);
    console.log("Private Key = ", getPrivateKey.toHexString());
    console.log("Address = ", checksumAddress(getAddress));
    console.log("\n");
  }
}

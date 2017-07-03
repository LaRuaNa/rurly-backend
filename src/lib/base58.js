const BTCAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// const FlickrAlphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const base = BTCAlphabet.length;


const encode = (id) => {
  let notEncodedId = id;
  let encodedId = '';
  let remainder;

  while (notEncodedId) {
    remainder = notEncodedId % base;
    notEncodedId = Math.floor(notEncodedId / base);
    encodedId = `${BTCAlphabet[remainder]}${encodedId}`;
  }
  return encodedId;
};

const decode = (number) => {
  let decodedNumber = 0;
  let encodedNumber = number;
  let index;
  let power;
  while (encodedNumber) {
    index = BTCAlphabet.indexOf(encodedNumber[0]);
    power = encodedNumber.length - 1;
    decodedNumber += index * (Math.pow(base, power));
    encodedNumber = encodedNumber.substring(1);
  }
  return decodedNumber;
};

module.exports.encode = encode;
module.exports.decode = decode;

var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || 'https://mainnet.infura.io/LwKpyKGklDOU4GJvC6ac');
var {ABI} = require('./abis');
var myContract = new web3.eth.Contract(ABI, '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',
  database: 'ok',
  table: 'kitties'
});

//connect to mysql databse
con.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});

//this function returns the total number of kitties
async function getTotalCount () {
  const number = await myContract.methods.totalSupply().call();
  console.log(number);
  return number;
}

//this function gets information for 20 kitties each time being run
async function getKitties (totalCount, kittyId) {
  var allKitties = [];

  const kitties = await Promise.all([
    myContract.methods.getKitty(kittyId).call(),
    myContract.methods.getKitty(kittyId+1).call(),
    myContract.methods.getKitty(kittyId+2).call(),
    myContract.methods.getKitty(kittyId+3).call(),
    myContract.methods.getKitty(kittyId+4).call(),
    myContract.methods.getKitty(kittyId+5).call(),
    myContract.methods.getKitty(kittyId+6).call(),
    myContract.methods.getKitty(kittyId+7).call(),
    myContract.methods.getKitty(kittyId+8).call(),
    myContract.methods.getKitty(kittyId+9).call(),
    myContract.methods.getKitty(kittyId+10).call(),
    myContract.methods.getKitty(kittyId+11).call(),
    myContract.methods.getKitty(kittyId+12).call(),
    myContract.methods.getKitty(kittyId+13).call(),
    myContract.methods.getKitty(kittyId+14).call(),
    myContract.methods.getKitty(kittyId+15).call(),
    myContract.methods.getKitty(kittyId+16).call(),
    myContract.methods.getKitty(kittyId+17).call(),
    myContract.methods.getKitty(kittyId+18).call(),
    myContract.methods.getKitty(kittyId+19).call()
  ]);
  allKitties = allKitties.concat(kitties);

return allKitties;
}


//this function produces a long string for 20 kitties following mysql statement syntax
async function buildKittySQLStr (allKitties, kittyId) {
  var currentKitty;
  var kittyStrPiece = '';
  var kittyStr = '';

  while(allKitties.length >= 1){
    currentKitty = allKitties.pop();
    kittyIsGasting = currentKitty.isGestating;
    kittyIsReady = currentKitty.isReady;
    kittyCooldown = currentKitty.cooldownIndex;
    kittyNextAction = currentKitty.nextActionAt;
    kittySiringWith = currentKitty.siringWithId;
    kittyBirthTime = currentKitty.birthTime;
    kittyMatronId = currentKitty.matronId;
    kittySireId = currentKitty.sireId;
    kittyGeneration = currentKitty.generation;
    kittyGenes = currentKitty.genes;
    kittyStrPiece = '(' + kittyId + ',' + kittyIsGasting + ',' +
      kittyIsReady + ',' + kittyCooldown + ',' + kittyNextAction + ',' +
      kittySiringWith + ',' + kittyBirthTime + ',' + kittyMatronId + ',' +
      kittySireId + ',' + kittyGeneration + ',' + kittyGenes + ')';
    kittyStr = kittyStr + kittyStrPiece + ',';
    kittyStrPiece = '';
    kittyId++;
  }
  kittyStr = kittyStr.slice(0, -1);
  return kittyStr;
}


//this function pushes information of 20 kitties into database
async function saveKittyToDB(kittyStr) {
  var sql = 'INSERT INTO kitties VALUES' + ' ' + kittyStr;
  return new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

//main function
async function task() {
  var kittyId = 1;
  const totalCount = await getTotalCount();
  while(kittyId <= totalCount){
      const allKitties = await getKitties(totalCount, kittyId);
      const kittyStr = await buildKittySQLStr(allKitties, kittyId);
      const sqlResult = await saveKittyToDB(kittyStr);
      kittyId = kittyId + 20;
    console.log('20 kitties have been added');
  }
}
task().then(() => {
  con.end();
  console.log('done!');
});

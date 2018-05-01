const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const request = require('request');

// modules required for Leader election
const leaderElection = require("exp-leader-election");

const HTTP_PORT = process.env.HTTP_PORT || 3005;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

var counter = 0;
let node_configuration = {};

/*
************************************************************
I. Node configuration Functionality
************************************************************
*/
let client_publicKey = wallet.publicKey;

function getConfiguration(){
  // Set the headers
  var headers = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/x-www-form-urlencoded'
  }

  // Configure the request
  var options = {
      url: 'http://127.0.0.1:8700/registerNode',
      method: 'POST',
      headers: headers,
      form: {'http_address': '127.0.0.1:'+HTTP_PORT, 'client_publicKey': client_publicKey, 'p2p_address': "ws://localhost:"+p2pServer.p2p_port}
  }

  // Start the request
  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          // Print out the response body
          console.log("Configuration:\n"+JSON.parse(body))
          node_configuration = JSON.parse(body);
          clearInterval(pinging_coordinator);
          setTimeout(leadership, 3000);     // Only after receiving configuration, node can take part in electoral duties
      }
  })
}

// If Coordinator isn't alive, keep pinging it till it comes to life
let pinging_coordinator = setInterval(getConfiguration, 3000);

/*
************************************************************
End I.
************************************************************
*/

/*
************************************************************
II. Leader Election Functionality
************************************************************
*/

var config = {
  key: "service/leadElection/leader",
  consul : {
    host: "127.0.0.1",
    port: 8500,
    ttl: 15,
    lockDelay: 2,
    readWait: 5
  }
}

function printCounter(){
  console.log(counter++);
}

function leadership(){
  leaderElection(config)
  .on("gainedLeadership", function () {
      // Whoo-hoo, we have been elected as leader! Do work.
      console.log("I am leader...")
      //setInterval(printCounter, 2000);
      function startBettingRound() {
        console.log("IN startBettingRound...")
        p2pServer.broadcastBettingRound("ws://localhost:"+p2pServer.p2p_port, node_configuration.constituencyID)
      }
      setTimeout(startBettingRound, 5000);
    })
  .on("error", function () {
     // Error occured, stop work.
     log.error("Leader election error occured", error);
    });
}

/*
************************************************************
End II.
************************************************************
*/

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect('/blocks');
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();
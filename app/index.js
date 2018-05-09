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
const P2P_PORT = process.env.P2P_PORT || 5005;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();


let p2pServer = {};

var counter = 0;
let node_configuration = {};
let flag = 0;
let peers = [];
let init_flag = false;

const tp = new TransactionPool();
p2pServer = new P2pServer(bc, tp, P2P_PORT, peers);
const miner = new Miner(bc, tp, wallet, p2pServer);
p2pServer.listen();

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
      form: {'http_address': '127.0.0.1:'+HTTP_PORT, 'client_publicKey': client_publicKey, 'p2p_address': "ws://localhost:"+P2P_PORT}
  }

  // Start the request
  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
            node_configuration = JSON.parse(body);
            console.log("NODE CONFIGURATION:\n"+JSON.stringify(node_configuration, undefined, 2));
            current_peers = node_configuration.peers;
            for(var i=0; i<current_peers.length; i++){
              if(current_peers[i]=="ws://localhost:"+P2P_PORT){
                continue;
              } else {

              }
            }
            clearInterval(pinging_coordinator);
            setTimeout(getConstituencyPeers, 10000);    
      }
  })
}

// If Coordinator isn't alive, keep pinging it till it comes to life
let pinging_coordinator = setInterval(getConfiguration, 5000);

function getConstituencyPeers(){
    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }

    // Configure the request
    var options = {
        url: 'http://127.0.0.1:8700/getPeers',
        method: 'POST',
        headers: headers,
        form: {'constituencyID':node_configuration.constituencyID}
    }


    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            peers = JSON.parse(body);
            console.log("NEWEST PEERS: "+ peers);
            p2pServer.updatePeers(peers);
            if(!init_flag){
              setTimeout(leadership, 5000);
              init_flag = true;
            }
        }
    });
} 

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


function printCounter(){
  console.log(counter++);
}

function leadership(){
  var config = {
    key: node_configuration.constituency, //Add functionality for constituency specific election
    consul : {
      host: "127.0.0.1",
      port: 8500,
      ttl: 15,
      lockDelay: 2,
      readWait: 5
    }
  }

  setInterval(getConstituencyPeers, 60000);
  console.log("In Elections")  
  p2pServer.setConstituencyID(node_configuration.constituencyID);
  leaderElection(config)
  .on("gainedLeadership", function () {
        console.log("I am leader...");
        var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
        }

        // Configure the request
        var options = {
            url: 'http://127.0.0.1:8700/leaderUpdate',
            method: 'POST',
            headers: headers,
            form: {'constituencyID': node_configuration.constituencyID, 'http_address': node_configuration.http_address, 'p2p_address': node_configuration.p2p_address}
        }
        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                console.log("Leader Updated to: "+node_configuration.http_address);
            }
        });
        p2pServer.PoS();

    })
  .on("error", function () {
     // Error occured, stop work.
     console.log("Leader election error occured", error);
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
  //console.log("Just Checking: "+JSON.stringify(transaction));
  p2pServer.broadcastTransaction(transaction);
  console.log("Received transaction:\nRecipient: "+recipient+"\nAmount: "+amount);
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

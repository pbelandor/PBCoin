const Websocket = require('ws');
const Utility = require("../util")
const utility = new Utility();
const request = require('request');

let gatherBets = {};
let ping_counter = 0;
let received_counter = 0;
let sockets = [];

let peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS',
  betting_begin: "BEGIN_BETTING",
  bets: "BETS"
};

class P2pServer {
  constructor(blockchain, transactionPool, P2P_PORT, peers) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
    this.constituencyID = "";
    this.p2p_port = P2P_PORT;
    this.bets = [];
    this.flag = 0;
    this.peers = peers;
  }

  setConstituencyID(cid){
    this.constituencyID = cid;
  }

  listen() {
    const server = new Websocket.Server({ port: this.p2p_port });
    server.on('connection', socket => this.connectSocket(socket));
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on: ${this.p2p_port}`);
  }

  connectToPeers() {
    this.peers.forEach(peer => {
      const socket = new Websocket(peer);
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    this.messageHandler(socket);
    this.sendChain(socket);
}

  
  requestGetPeers() {
    console.log("In requestGetPeers...")
    console.log("*****: "+sockets)

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
        form: {'constituencyID':this.constituencyID}
    }

    var self = this;

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log("Peers:\n"+body)
            console.log("*****: "+sockets);
            peers = JSON.parse(body);
            console.log(peers[0]);
            setTimeout(self.connectToPeers, 5000)
        }
    });
  }

  updatePeers(updated_peers) {
    this.peers = updated_peers;
    this.connectToPeers();
  }

  getConstituencyPeers(){
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
        form: {'constituencyID':this.constituencyID}
    }


    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            peers = JSON.parse(body);
            console.log("NEWEST PEERS: "+ peers);
            this.updatePeers(peers);
            this.PoS();
        }
    });
  }
 

  PoS(){
    
    this.peers = utility.removeDuplicates(this.peers);
    this.peers.sort();
    var no_of_participants = this.peers.length;
    console.log("Peers: "+this.peers);
    console.log("No of participants: "+no_of_participants);
    let rawMatrix = utility.Create2DArray(no_of_participants);
    let wtMatrix = utility.Create2DArray(no_of_participants);
    let probMatrix = utility.Create2DArray(no_of_participants);

    var posMatrix = utility.createPosMatrix(rawMatrix, no_of_participants);
    utility.printMatrix(posMatrix, no_of_participants)
    utility.GetTotals(posMatrix, no_of_participants)
    wtMatrix = utility.GetWts(wtMatrix, posMatrix, no_of_participants);
    probMatrix = utility.GetProbs(probMatrix, wtMatrix, no_of_participants);
    utility.printMatrix(probMatrix, no_of_participants);
    let winnerCouple = utility.RunRoulette(probMatrix, no_of_participants);
    let A = parseInt(winnerCouple.better);
    console.log(typeof(A))
    let B = parseInt(winnerCouple.bettee);
    console.log("Winning Couple!\nBetter: "+this.peers[A]+" and Bettee :"+this.peers[B]);


    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
        }

    // Configure the request
    var options = {
        url: 'http://127.0.0.1:8700/blockMined',
        method: 'GET',
        headers: headers,
        qs: {"miner": '127.0.0.1:3'+this.peers[A].slice(-3), "constituencyID": this.constituencyID}
    }
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    });


    // Send request to bettee to mine transactions into block
    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }

    // Configure the request
    var options = {
        url: 'http://127.0.0.1:3'+this.peers[B].slice(-3)+'/mine-transactions',
        method: 'GET',
        headers: headers,
        qs: {}
    }
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            console.log("Bettee has successfully Mined block.");
        }
    });
  }

  gatherBetsFromNodes(sender_bets, sender){
    console.log("IN gatherBetsFromNodes...");
    console.log("gatherBetsFromNodes.sender: "+sender);
    console.log("gatherBetsFromNodes.senderBets: "+sender_bets);
    console.log("Received Counter: "+ received_counter)
    if(ping_counter == received_counter++) this.PoS();
    gatherBets[sender] = [];
    console.log("PARTITICPANTS: "+ this.participants)
    console.log("Sender: "+sender);
    console.log("Sender Bets: "+sender_bets);
    gatherBets[sender] = sender_bets;
    console.log("TTTT: "+typeof(gatherBets[sender]));
    //console.log(Object.keys(this.gatherBets))
  }

  sendBets(socket, bets){
    console.log("IN sendBets...");
    console.log("sendBets.socket: "+socket.url);
    console.log("Sending Bets: "+bets)
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.bets,
      sender: this.p2p_port,
      bets: bets
    }));
  }

  prepareBets(leaderAddress) {
    console.log("IN prepareBets...");
    console.log("prepareBets.LEADER_ADDRESS: "+leaderAddress);
    sockets.forEach(socket => {
      //ip = socket.
      //console.log("Socket IP Addresses")
      console.log("Socket URL inside Prepare BEts: "+socket.url)
      if(socket.url != leaderAddress) {
        console.log("sending a bet...")
        var amt=5;
        var data = socket.url+"~"+amt
        this.bets.push(
          data
        );
      }
    });
    this.bets.forEach(bet => {
      console.log("Bet: "+bet);
    })
    // Find the leader in sockets
    sockets.forEach(socket => {
      console.log("SOCKET URL: "+socket.url)
      console.log("LEADER ADDRESS: "+leaderAddress)
      if(leaderAddress == socket.url){
        this.sendBets(socket, this.bets);
        return;
      }
    });

  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear();
          break;
         //Watch for leader
        case MESSAGE_TYPES.betting_begin:
          this.requestGetPeers();
          this.prepareBets(data.leaderAddress);
          console.log("In Message Handler: "+data.leaderAddress)
          break;
        case MESSAGE_TYPES.bets:
          this.gatherBetsFromNodes(data.bets, data.sender);
          break;
      }
    });
  }
//2
  sendBettingRoundPing(socket, leaderAddress) {
    console.log("IN sendBettingRoundPing...");
    console.log("sendBettingRoundPing.LEADER_ADDRESS: "+leaderAddress);
    console.log("sendBettingRoundPing.socket: "+socket.readyState);
    console.log("*****: "+sockets)
    ping_counter = ping_counter + 1;
    console.log("Ping_counter: "+ping_counter)
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.betting_begin,
      leaderAddress: leaderAddress
    }));

    
  }

// 1
  broadcastBettingRound(leaderAddress) {
    console.log("IN broadcastParticipationRequest...");
    console.log("broadcastParticipationRequest.LEADER_ADDRESS: "+leaderAddress);
    sockets.forEach(socket => {
      console.log("Sending ping to: "+socket.url);
      this.sendBettingRoundPing(socket, leaderAddress);
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }

  syncLeaders() {
    sockets.forEach(socket => this.sendchain(socket))
  }

  syncChains() {
    sockets.forEach(socket => this.sendChain(socket));
  }

  broadcastTransaction(transaction) {
    sockets.forEach(socket => this.sendTransaction(socket, transaction));
    
  }

  broadcastClearTransactions() {
    sockets.forEach(socket => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transactions
    })));
  }
}

module.exports = P2pServer;
const Websocket = require('ws');
const Utility = require("../util")
const utility = new Utility();
const request = require('request');

let gatherBets = {};
let ping_counter = 0;
let received_counter = 0;

const P2P_PORT = process.env.P2P_PORT || 5005;
let peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS',
  betting_begin: "BEGIN_BETTING",
  bets: "BETS"

};

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
    this.p2p_port = P2P_PORT;
    this.bets = [];
  }

  connectSocket(socket) {
    //console.log(Object.values(socket));
    this.sockets.push(socket);
    console.log('Socket connected');

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    let ip = "";
    let peer = "";
    server.on('connection', socket => this.connectSocket(socket));

    this.connectToPeers();

    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    peers.forEach(peer => {
      this.sockets.forEach(socket => {
        if(socket.url != peer){
          //
        } else {
          const sock = new Websocket(peer);
          sock.on('open', () => this.connectSocket(sock));        }
      });    
    });
  }

  requestGetPeers(constituencyID) {
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
        form: {'constituencyID':constituencyID}
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log("Peers:\n"+body)
            peers = body;
        }
    });
    return;
  }

  

  PoS(){
    console.log("IN PoS...");
    var keys = Object.keys(gatherBets).sort();
    console.log("KeyS: "+keys);
    let rawMatrix = utility.Create2DArray(keys.length);
    var posMatrix = utility.createPosMatrix(rawMatrix, gatherBets, keys.length, keys)
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
    this.sockets.forEach(socket => {
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
    this.sockets.forEach(socket => {
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
          this.prepareBets(data.leaderAddress);
          console.log("In Message Handler: "+data.leaderAddress)
          break;
        case MESSAGE_TYPES.bets:
          this.gatherBetsFromNodes(data.bets, data.sender);
          break;
      }
    });
  }

  sendBettingRoundPing(socket, leaderAddress) {
    console.log("IN sendBettingRoundPing...");
    console.log("sendBettingRoundPing.LEADER_ADDRESS: "+leaderAddress);
    console.log("sendBettingRoundPing.socket: "+socket.readyState);
    ping_counter = ping_counter + 1;
    console.log("Ping_counter: "+ping_counter)
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.betting_begin,
      leaderAddress: leaderAddress
    }));

    
  }

  broadcastBettingRound(leaderAddress, constituencyID) {
    console.log("IN broadcastParticipationRequest...");
    console.log("broadcastParticipationRequest.LEADER_ADDRESS: "+leaderAddress);
    //console.log("CHECK: "+this.sockets[0].url)
    //setTimeout(this.PoS, 25000);
    this.requestGetPeers(constituencyID);
    this.connectToPeers();
    this.sockets.forEach(socket => {
      console.log(Object.keys(socket));
      this.sendBettingRoundPing(socket, leaderAddress);
    });
    setTimeout(this.PoS, 10000)
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

  syncChains() {
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }

  broadcastClearTransactions() {
    this.sockets.forEach(socket => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transactions
    })));
  }
}

module.exports = P2pServer;
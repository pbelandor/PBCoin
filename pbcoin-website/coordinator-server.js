var constituency_roulette = 0;
let no_of_constituencies = 2;
let constituent_keys = [];
var Consul = require('consul');
let applicationUsage = [];
let peersInConstituencies = {};

var opts = {
	'host': "127.0.0.1",
	'port': 8500
}


class coordinatorServer {
	constructor(){
		this.nodes = [];
		this.createConstituencies();
	}

	createConstituencies(){
		var consul = Consul(opts);
		for(var i=0; i<no_of_constituencies; i++){
			consul.kv.set('service/leadElection/leader'+i, '', function(err, result) {
			  if (err) throw err;
			});

			peersInConstituencies["c"+i] = [];
		}

		consul.kv.keys('service/leadElection/', function(err, result) {
		  if (err) throw err;
		  console.log(result)
		  constituent_keys = result
		});
	}

	addNode(http_address, client_publicKey, p2p_address){
		let client_obj = {};
		let client_obj_with_constituency = {};
		let client_obj_with_PEERS = {};
		client_obj = {
			"http_address": http_address,
			"client_publicKey": client_publicKey,
			"p2p_address": p2p_address
		}
		// Assign node a constituency
		client_obj_with_constituency = this.assignConstituency(client_obj);

		// Send node a list of PEERS
		client_obj_with_PEERS = this.peerManagement(client_obj_with_constituency);

		// Push node into registry
		this.nodes.push(client_obj_with_PEERS);

		// Print the current registry of nodes everytime new node is added
		this.nodes.forEach(node => {
			console.log(JSON.stringify(node, undefined, 2));
		})

		return client_obj_with_constituency;
	}

	assignConstituency(client_obj){
		let constituency_chosen = constituency_roulette++%no_of_constituencies;
		client_obj.constituency = "service/leader-election/leader"+constituency_chosen;
		client_obj.constituencyID = "c"+constituency_chosen;
		return client_obj;
	}

	peerManagement(client_obj_with_constituency){
		for(var i=0; i<no_of_constituencies; i++){
			if(client_obj_with_constituency.constituencyID == "c"+i){
				client_obj_with_constituency.peers = peersInConstituencies["c"+i];
				peersInConstituencies["c"+i].push(client_obj_with_constituency.p2p_address);
				console.log(peersInConstituencies["c"+i])
			}
		}
		console.log(client_obj_with_constituency.peers);
		return client_obj_with_constituency;
	}

	updateVotes(vote){
		if(vote == "upvote"){
			applicationUsage.push({
				"type": "Upvote",
				"postID": 1,
				"user": "ApplicationUser"
			});
		}
		else {
			applicationUsage.push({
				"type": "Downvote",
				"postID": 1,
				"user": "ApplicationUser"
			});
		}
	}

	getPeers(client_constituencyID){
		console.log("CID: "+client_constituencyID)
		return peersInConstituencies[client_constituencyID]
	}

	makeTransaction(amount, recipient, sender){
		
	}
}

module.exports = coordinatorServer;
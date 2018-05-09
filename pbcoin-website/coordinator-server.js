var constituency_roulette = 0;
let no_of_constituencies = 3;
let constituent_keys = [];
var Consul = require('consul');
var fs = require('fs');
let applicationUsage = [];
let peersInConstituencies = {};
let leaders = {};

var opts = {
	'host': "127.0.0.1",
	'port': 8500
}


class coordinatorServer {
	constructor(){
		this.nodes = [];
		this.createConstituencies();
	}

	updateVisualisation(operation){
		var data = require('./public/flare.json');
		var data2 = require('./public/chart.json')
		console.log("IN")
		switch(operation.type){
			case "addConstituency":
				data.children.push({
					"name": operation.data,
					"children": []
				});
				data2.datapoints.push({
					"label": operation.data,
					"y": 0
				});
				fs.writeFileSync("./public/chart.json", JSON.stringify(data2, null, 2));
				fs.writeFileSync("./public/flare.json", JSON.stringify(data, null, 2));
				break;
			case "addNode":
				for(var i=0; i<data.children.length; i++){
					if(data.children[i].name == operation.constituencyID){
						data.children[i].children.push({
							"name": operation.http_address,
							"size": 3000
						})
					}
				}
				fs.writeFileSync("./public/flare.json", JSON.stringify(data, null, 2));
				break;
			case "blockMined":
				for(var i=0; i<data.children.length; i++){
					for(var j=0; j<data.children[i].children.length; j++){
						if(data.children[i].children[j].name == operation.data){
							let current_size = parseInt(data.children[i].children[j].size)
							let new_size = current_size+2000;
							data.children[i].children[j].size = new_size;
						}
					}
				}
				for(var i=0; i<data2.datapoints.length; i++){
					if(data2.datapoints[i].label == operation.constituencyID){
						data2.datapoints[i].y += 1;
						console.log("Update")
					}
				}
				fs.writeFileSync("./public/chart.json", JSON.stringify(data2, null, 2));
				fs.writeFileSync("./public/flare.json", JSON.stringify(data, null, 2));
				break;
		}
	}

	/*
	I. Client Node specific functionality
	*/

	createConstituencies(){
		var consul = Consul(opts);
		for(var i=0; i<no_of_constituencies; i++){
			consul.kv.set('service/leadElection/leader'+i, '', function(err, result) {
			  if (err) throw err;
			});
			this.updateVisualisation({"type": "addConstituency", "data": "c"+i})
			peersInConstituencies["c"+i] = [];
		}

		consul.kv.keys('service/leadElection/', function(err, result) {
		  if (err) throw err;
		  console.log(result)
		  constituent_keys = result
		});
	}

	addNode(http_address, client_publicKey, p2p_address){
		let node_present = false;
		let present_node = {}
		//console.log("Adding new Node...")
		this.nodes.forEach(node =>{
			if(node.p2p_address.toString() == p2p_address){
				console.log("Node already present.."+JSON.stringify(node))
				node_present = true;
				present_node = node;
				return node;
			}
		});

		if(node_present) return present_node;
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

		this.updateVisualisation({"type": "addNode", "http_address": http_address, "constituencyID": client_obj_with_constituency.constituencyID})

		// Print the current registry of nodes everytime new node is added
		//this.nodes.forEach(node => {
		//	console.log(JSON.stringify(node, undefined, 2));
		//})

		return client_obj_with_constituency;
	}

	assignConstituency(client_obj){
		let constituency_chosen = constituency_roulette++%no_of_constituencies;
		client_obj.constituency = "service/leadElection/leader"+constituency_chosen;
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
		//console.log(client_obj_with_constituency.peers);
		return client_obj_with_constituency;
	}

	getPeers(client_constituencyID){
		console.log("CID: "+client_constituencyID)
		return peersInConstituencies[client_constituencyID]
	}

	updateLeader(client_constituencyID, http_address, p2p_address){
		leaders[client_constituencyID] = p2p_address;
	}

	/*
		End of I.
	*/

	/*
	II. Application specific functionality
	*/

	updateVotes(vote){
		if(vote == "up"){
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

	

	makeTransaction(amount, recipient){
		let transaction_obj = {};
		transaction_obj.recipient = recipient;
		transaction_obj.amount = amount;
		var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
        }

        // Configure the request
        var options = {
            //url: 'http://127.0.0.1:'+leaders["c0"].http_address.slice(-4)+'/transact',
            url: nodes[0].http_address+'/transact',
            method: 'POST',
            headers: headers,
            form: {'recipient':transaction_obj.recipient, 'amount': transaction_obj.amount}
        }
        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        });
	}



	/*
		End of II.
	*/
}

module.exports = coordinatorServer;
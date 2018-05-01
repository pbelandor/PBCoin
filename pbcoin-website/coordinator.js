const express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
const HTTP_PORT = process.env.HTTP_PORT || 8700;
const app = express(bodyParser());
var upload = multer();
const Coordinator = require("./coordinator-server");

const coordinator = new Coordinator();


// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 

// serve static content
app.use(express.static("public"));

/*
I.	Handling web application requests
*/
app.get("/", (req, res) => {
	console.log("Served Home page...")
	res.sendFile( __dirname + "/" + "public/index.html" );
})

app.get("/vote", (req, res) => {
	coordinator.updateVotes(req.param('vote'));
	console.log(req.param('vote'));
	res.status(200);
})

app.get("/sendMoney", (req, res) => {
	coordinator.makeTransaction(req.amt, req.recipient, req.sender);
	res.status(200);
})

/*
II. Handling node registration
*/

app.post('/registerNode', (req, res) => {
	console.log("Here...")
  http_address = req.body.http_address;
  client_publicKey = req.body.client_publicKey;
  p2p_address = req.body.p2p_address;

  // Add Node to registry
  registered_node = coordinator.addNode(http_address, client_publicKey, p2p_address);

  res.send(JSON.stringify(registered_node, undefined, 2));
});

/*
III. Node Utilities
*/
app.post('/getPeers', (req, res) => {
	client_constituencyID = req.body.constituencyID;
	list_of_peers = coordinator.getPeers(client_constituencyID);
	res.send(list_of_peers);
})


app.listen(HTTP_PORT, () => console.log(`Coordinator Node listening on port ${HTTP_PORT}`));

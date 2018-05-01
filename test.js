var Etcd = require("node-etcd");
var etcdLeader = require("etcd-leader");

var etcd = new Etcd("localhost", 4001);

// First parameter is etcd key to use for election.
// Second parameter is name of this node.
// Third parameter is the expiry window for master election.
var election = etcdLeader(etcd, "/master", "foo", 10).start();

election.on("elected", function() {
  console.log("I am the MASTER.");
});

election.on("unelected", function() {
  console.log("I am no longer the MASTER.");
});

election.on("leader", function(node) {
  console.log("Leader is now " + node);
});
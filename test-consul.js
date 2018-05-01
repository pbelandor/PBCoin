var leaderElection = require("exp-leader-election");
var counter = 0;

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

leaderElection(config)
.on("gainedLeadership", function () {
    // Whoo-hoo, we have been elected as leader! Do work.
    console.log("I am leader...")
    setInterval(printCounter, 2000);
  })
.on("error", function () {
   // Error occured, stop work.
   log.error("Leader election error occured", error);
  });
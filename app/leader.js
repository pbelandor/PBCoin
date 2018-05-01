class Leader {
	constructor(P2PServer){
		this.p2pServer = P2PServer;
		console.log(p2pServer);
	}
/* TBD?
	requestParticipation(){
		p2pServer.broadcastParticipantionRequest({
			leaderAddress: this.leaderAddress
		});
	}

	function broadcastParticipants(){

    }
*/

	startBettingRound() {
		this.p2pServer.broadcastBettingRound("ws://localhost:"+this.leaderAddress)
	}


}

module.exports = Leader;
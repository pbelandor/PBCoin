#!/bin/bash
# File: ~/launch_dev.sh

function new_tab() {
  TAB_NAME=$1
  COMMAND=$2
  osascript \
    -e "tell application \"Terminal\"" \
    -e "tell application \"System Events\" to keystroke \"t\" using {command down}" \
    -e "do script \"printf '\\\e]1;$TAB_NAME\\\a'; $COMMAND\" in front window" \
    -e "end tell" > /dev/null
}

# First, startup the Consul Service Discovery daemon. Sleep for 5 seconds before starting up other nodes
new_tab "Consul Leader Election Service" "consul agent -dev"
sleep 12s

# Start the coordinator Node
new_tab "Coordinator" "cd ~/Documents/ProjectArcane/PBCoin/pbcoin-website; node coordinator.js"
sleep 3s

# Open n instances of Client Nodes
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3010 P2P_PORT=5010 npm run dev"
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3011 P2P_PORT=5011 npm run dev"
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3012 P2P_PORT=5012 npm run dev"
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3013 P2P_PORT=5013 npm run dev"
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3014 P2P_PORT=5014 npm run dev"
new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3015 P2P_PORT=5015 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3016 P2P_PORT=5016 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3017 P2P_PORT=5017 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3018 P2P_PORT=5018 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3019 P2P_PORT=5019 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3020 P2P_PORT=5020 npm run dev"
#new_tab "Node Instance" "cd ~/Documents/ProjectArcane/PBCoin; HTTP_PORT=3021 P2P_PORT=5021 npm run dev"



*(e. Read me file should contain the details of*
*the variables used, ~~salient features of the software and procedure of using them~~:*
*~~compiling procedure~~, details of the computer hardware/software requirements to run the*
*same, etc. If the developed software uses any public domain software downloaded from*
*some site, then the address of the site along with the module name etc. must be included*
*on a separate sheet. It must be properly acknowledged in the acknowledgments)*

# Proof of Stack

------

Hybrid leader based Consensus mechanism in blockchain based applications.


### Content

------

1. Overview
2. Features
3. Installation
4. Usage
5. Classes
6. Open Source Dependencies
   - Node.js
   - Consul.io

#### Overview

------

A hybrid leader approach at achieving consensus in Distributed Applications (DApps) using a novel consensus mechanism tentatively called *Proof of Stack*. 
The approach is aimed at open blockchain systems that need to scale to nore client nodes that participate in maintaining the network's functionality.

The process of consensus broadly involves 3 steps: 
*Leader Election*, *Placing Bets/Stacking Bets* and *Leader-wide agreement*.

It is essentially a hierarchical staging of consensus with a divide and conquer approach at achieving early stage consensus.

The consensus mechanism is presented as a Proof of Concept application (a Social Media DApp, that incentivizes authors and the curators of the content).

#### Features

------

- A hierarchical consensus mechanism that can scale with new core nodes
- A cryptocurrency "___", that is used by the network to incentivise the application users to maintain the integrity of the content of the application and to reward core clients for their transaction processing and collating duties.
- A Proof of Concept application: "___": Incentivised Social media in Alpha test stage
- Use of cryptographic protocols for security and digital signatures
- ​



#### Installation

------

- Ensure you have **Node.js** installed. You can find compiled source files for your system [here.](https://nodejs.org/en/download/)

  Find the Github repository [here](). 

  You can simply download the Zip folder or clone it into your directory:

```shell
mkdir PoS

git clone http://www.github.com/....
```

​	Alternatively, place the folder "" found in the CD onto your desktop.
​	Then run the following command to install the dependencies:

```shell
npm install
```



- You will also need to install **Consul**, you can find the precompiled binaries [here](https://www.consul.io/downloads.html).

  After installation make sure to add consul to your PATH.

```shell
export PATH=$PATH:/path/to/consul
```



#### Usage

------

- Initializing one cluster

​	Start the consul agent:

```shell
consul agent dev	
```

​	Create a key in the KV store for Leader Election Protocol:

```Shell

```

​	Run instances of the node:

```shell
HTTP_PORT=<httpPort> P2P_PORT=<p2pPort> PEERS=<list-Peers> npm run dev
```



#### Classes

------

| Classes   | Functionality |      |
| --------- | ------------- | ---- |
| P2PServer |               |      |
| Miner     |               |      |
|           |               |      |

```
git commit -m "first commit"
git remote add origin https://github.com/pbelandor/PBCoin.git
git push -u origin master
```
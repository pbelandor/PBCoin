let downVote_Count = 0;
let upVote_Count = 0;

function getPost(id){
	console.log(id);
}

function upvotePost(){
	console.log("Upvoted");
	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	if(downVote_Count>0){
	    		document.getElementById("downvote").innerHTML = --downVote_Count;
	    	}
	    	else {
	        	document.getElementById("upvote").innerHTML = upVote_Count++;
			}
	    }
	};
    xhttp.open("GET", "http://localhost:8300?vote=up", true);
    xhttp.send();
    return;
}

function downvotePost(id){
	console.log("Downvoted");
	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	if(upVote_Count>0){
	    		document.getElementById("upvote").innerHTML = --upVote_Count;
	    	}
	    	else {
	   		    document.getElementById("downvote").innerHTML = downVote_Count++;
	   		}
	    }
	};
    xhttp.open("GET", "http://localhost:8300/post.html?vote=down", true);
    xhttp.send();
    return;
}
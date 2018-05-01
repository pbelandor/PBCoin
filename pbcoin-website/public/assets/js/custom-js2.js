// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

var sendButton = document.getElementById("sendButton");

sendButton.onclick = function() {
	var xhttp = new XMLHttpRequest();
	var amount = document.getElementById("amount").value;
  	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	console.log("Money Sent!")
	    }
	};
    xhttp.open("GET", "http://localhost:8300/sendMoney?amt="+amount, true);
    xhttp.send();
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Requires hLib > v0.1


// Configuration Variables

const tUrl = "/track";
const heartbeat = 10000;

// Variables


// Functions

function sendHeartbeat() {

$h.sendPost(tUrl, '', function() {

	var x = this.response;
	x=JSON.parse(x);
	for (var y = 0; y < x.length; y++) {
		log(x[y][0], x[y][1], x[y][2]);
	}

});

}



// Startup


setInterval(sendHeartbeat, heartbeat);


console.info("Tracking module installed correctly.  Tracking to "+tUrl+".  Heartbeat interval is "+heartbeat+"ms.");

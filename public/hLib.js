// hLib rewrite because old one got lost somewhere in the void


// The objecttheoBjEcTthEOB J E C T THEoBjeCT haIlthEoBJECTtheobjectheobjectheobjECTHEOBJECTHEOBJECTHEOBJE C T H E O B J E C T

var $h = {
	"version" : "v0.0.1",
	"sendPost" : function(recipient,data,callback) {
					try {
						if (recipient==undefined) {throw "You need a recipient for sendPost!";}
						var request = new XMLHttpRequest;
						request.open("POST",recipient);
						if (callback!=undefined) {
						request.addEventListener("load",callback);
						}
						request.addEventListener('error', function(er) {
							throw er;
						});
						request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
						request.send(data);
					} catch(data) {
						console.error('$h.sendPost() failed! Data thrown: '+data);
					}
				},
	"RNG" : function(mina, maxa, rounda) {
					var dif = maxa - mina;
					var rn = (Math.random()*dif);
					if (!rounda) return rn+mina;
					return Math.floor(rn+mina);
	},
	"randomFromArray": function(a) {
		return a[$h.RNG(0,a.length,true)];
	},

	"trackingMouse":false,
	"mouseTrackingListener": undefined,
	"mouseX":undefined,
	"mouseY":undefined,

	"startMouseTracking":function() {

		try {
			if (!$h.trackingMouse) {
				if ($h.mouseTrackingListener==undefined) {
					$h.mouseTrackingListener = addEventListener('mousemove', function(e) {
						$h.mouseX = e.x;
						$h.mouseY = e.y;
					});
					$h.trackingMouse = true;
					return 'Started tracking the mouse.';
				} else {
					throw 'Mouse tracking listener already exists!';
				}
			} else {
				throw 'Tracking mouse already, can\'t start what\'s already happening.';
			}
		} catch(err) {
			console.error('$h.startMouseTracking: '+err);
			return false;
		}
	},
	"stopMouseTracking": function() {
		try {
			if ($h.trackingMouse) {
				if ($h.mouseTrackingListener!=undefined) {
					removeEventListener($h.mouseTrackingListener);
					$h.mouseTrackingListener=undefined;
					$h.trackingMouse = false;
					return 'Stopped tracking the mouse.';
				} else {
					throw 'Unsure how you did this, but mouse tracking is already off.';
				}
			} else {
				throw 'Not tracking mouse currently, can\'t stop what\'s not happening.';
			}
		} catch(err) {
			console.error('$h.stopMouseTracking: '+err);
			return false;
		}
	},

	"list" : function() {
		console.info("var version (read-only)");
		console.info("function sendPost(string recipient, string data, function callback)");
		console.info("function RNG(int min, int max, boolean floor)");
		console.info("function randomFromArray(array)");
		console.info("function startMouseTracking()");
		console.info("function stopMouseTracking()");
		console.info("var isTrackingMouse (read-only)");
		console.info("var mouseX (read-only)");
		console.info("var mouseY (read-only)");

	}
}



// Startup

console.info('Running hLib '+$h.version);

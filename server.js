/*

Code by H

d o d g e b a l l


*/




/* Requires */



	const express = require("express");
	const bodyParser = require("body-parser");
	const cookieParser = require("cookie-parser");
	const expressLayouts = require("express-ejs-layouts");
	const fs = require('fs');

/* var socketio = require("socket.io"); */
/* Socketio was crashing it -  heck if I know why */


/* Config object */


var gameConfig = {

	gameSpeed: 500,
	/* ms between ticks */
	distInTick: 100,
	/* how far a projectile goes in one tick */
	spamfactor: 500,
	/* how long you have to wait before you can throw again */
	projectiletime: 60000,
	/* how long a projectile 'lives' */
	blurplechance: 0.1,
	/* b l u r p l e */
	mnl: 11
	/* how long your name can be - currently not implemented but I left it there as a reminder to create it */

}


var heartbeat = 4000;
/* ms before client is considered dead */



const levelOfFeedback = 4;
/*
Level of feedback determines what gets sent to the console.
LOF 4 sends everything
LOF>3 sends logs
LOF>2 sends warns
LOF>1 sends errors
LOF>0 sends infos
*/

const bossNames = ['Arnold, destroyer of worlds', 'Vermin Supreme', '[insert your mom joke here]', '<span class=\'small\'>BADGER BADGER BADGER BADGER BADGER BADGER BADGER BADGER BADGER BADGER BADGER BADGER</span> MUSHROOM M U S H R O O M', 'lennyface', 'obama\'s last name is \'care\'', 'alt+f4 for free robux', 'the man, the myth, the legend, Hugh.', 'this boss\'s power is an inverse function of my code\'s cleanliness', 'I\'m running out of creativity for boss names here'];


/* Variables */

var c = {"m":{"italics":"\x1b[3m","reset":"\x1b[0m","bright":"\x1b[1m","dim":"\x1b[2m","underscore":"\x1b[4","blink":"\x1b[5m","reverse":"\x1b[7m","hidden":"\x1b[8m","m":"\x1b["},"f":{"black":"\x1b[30m","red":"\x1b[31m","green":"\x1b[32m","yellow":"\x1b[33m","blue":"\x1b[34m","purple":"\x1b[35m","cyan":"\x1b[36","white":"\x1b[37m"},"b":{"black":"\x1b[40m","red":"\x1b[41m","green":"\x1b[42m","yellow":"\x1b[43m","blue":"\x1b[44m","purple":"\x1b[45m","cyan":"\x1b[46","white":"\x1b[47m"}};

for (key in c) {
	for (key2 in c[key]) {
		c[key][key2] = "";
	}
}

var clients = {};
var bossmode = false;
var custom = {
	'css':''
	};
	
var boss;
/* thinking of expanding 'custom', which is why it's an object and not a variable */


/* Module setup */

var app = express();
var staticFiles = express.static(__dirname + "/public");
var urlencoded = bodyParser.urlencoded({ extended: true });
app.use(cookieParser());
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(urlencoded);
app.use(staticFiles);

/* var io = socketio.listen(server); */


/* Startup. */



if (levelOfFeedback>0) {
	console.info("\x1b[1m[info]  ["+Date().substring(16,24)+"] Setting up server... \x1b[0m");
}

if (process.argv[2]=='-hport') {
	if (Number(process.argv[3])) {
		var server = app.listen(process.argv[3], onStartup);
	} else {
		console.error(c.m.bright+c.b.red+c.f.white+"[error] ["+Date().substring(16,24)+"] hport needs  a number between 00000 and 99999"+c.m.reset);
		process.exit();
	}
} else {
	try {
		var server = app.listen(process.env.PORT,onStartup);
	} catch (data) {
		console.log(data);
	}

}

/* 🦀🦀🦀🦀 stdin is dead for no apparent reason 🦀🦀🦀🦀
   ----------------------------------------------------------
   🦀🦀🦀🦀 stdin is dead for no apparent reason 🦀🦀🦀🦀 */
var stdin = process.openStdin();

stdin.addListener('data',function(d) {
	/* Check if I'm just restarting the server. if so, ignore */
	if (!d.toString().includes('rs')) {
		try {
			eval(d.toString());
		} catch(data) {
			console.log(c.m.reset+c.m.bright+c.f.yellow+data+c.m.reset);
		}
	}


});





/* Debug functions */

var con = {	"log":function(a,b){		if (levelOfFeedback>3) {			console.log(c.m.reset+c.m.dim+"[log]   ["+Date().substring(16,24)+"] "+a+c.m.reset);			}		},	"warn":function(a){		if (levelOfFeedback>2) {			console.warn(c.m.reset+c.m.bright+c.f.yellow+"[warn]  ["+Date().substring(16,24)+"] "+a+c.m.reset);			}		},	"error":function(a){		if (levelOfFeedback>1) {			console.error(c.m.bright+c.b.red+c.f.white+"[error] ["+Date().substring(16,24)+"] "+a+c.m.reset);			}		},	"info":function(a){		if (levelOfFeedback>0) {			console.info(c.m.bright+"[info]  ["+Date().substring(16,24)+"] "+a+c.m.reset);			}		},	"write":function(a){		process.stdout.write(a);		},
}




/* Other functions */



function jsonConcat(o1, o2) {
	for (var key in o2) {
		o1[key] = o2[key];
	}
	return o1;
}



function onStartup() {
	con.info("Server started at 0.0.0.0:"+server.address().port);
}

function ezRoute(name, path, obj) {
	con.log("[ezRoute] setup " + name + " from " + path);
	app.get(name, function(req, res) {
		con.log("Was asked for "+path)
			res.render(path, obj);

	});
}

/* round to [nearest] hundred */
function rth(a) {
	var x = a;
	x = x/100;
	x = Math.round(x);
	x = x*100;
	return x;
}




/* detect projectile collision */
function dpc(x,y,id) {
		
	for (k in clients) {
		if ((!(clients[k]==null||clients[k]==undefined)&&clients[k].type=='projectile')&&clients[k].owner!=id) {
			if (rth(clients[k].x)==x&&rth(clients[k].y)==y) {
				if (!clients[id].godmode) {
					clients[clients[k].owner].score++;
					clients[id].hit++;
					clients[id].hp--;
					
					if (bossmode) {
						if (clients[id].type=='boss'&&clients[id].hp<=0) {
							clients[id].dead=true;
							delete clients[id];
							bossmode=false;
						}
					}
					
					return k;
					}
				}
			
		}
	}
	
	
	
	return false;
	
}


function makeABoss() {

	bossmode=true;
	boss = {
			"uid":'[BOSS]',
			'x':500,
			'y':500,
			'namea':'[BOSS]',
			'tsl':0,
			'dead':false,
			'type':'boss',
			'ttn':0,
			'score':0,
			'hit':0,
			'projsent':0,
			'godmode':false,
			'fn':'',
			'ufn':false,
			'hp':10,
			'freeze': false,
			'nameb':bossNames[Math.floor(Math.random()*bossNames.length)]
	};
	
	clients['[BOSS]']=boss;

}

/* Routing */
app.get('/', (req, res) => {
	if (req.cookies['uid']==undefined) {
		var y = Math.floor(Math.random()*3000);
		while (clients[y]!=undefined) {
		y = Math.floor(Math.random()*3000);
		}
		res.cookie('uid',y);
	}
	res.render('index');
});

ezRoute('/cpanel', 'cpanel');

app.post('/boss', (req,res) => {
	res.send();
	makeABoss();
});

app.get('/cpanel.js', (req, res) => {
	res.sendFile(__dirname+"/private/cpanel.js");
});

app.get('/cpanel.css', (req, res) => {
	res.sendFile(__dirname+"/private/cpstyles.css");
});


app.post('/cpc', (req, res) => {
	
	
	
	
	res.send(true);
});

/* learned how to () => {} halfway through this so around half post/get callbacks are function() {} and half are () => {} */

app.post('/', function(req, res) {




	var player = JSON.parse(req.body.playera);
	
	if (player.x == undefined || player.y == undefined || player.namea == undefined) {
		res.send(false);
		return;
	}
	


	
	if (clients[req.cookies['uid']] == undefined) {
		clients[req.cookies['uid']] = {
			"uid":req.cookies['uid'],
			'x':500,
			'y':500,
			'namea':req.cookies['uid'],
			'tsl':0,
			'dead':false,
			'facing':'up',
			'type':'player',
			'ttn':0,
			'score':0,
			'hit':0,
			'projsent':0,
			'godmode':false,
			'fn':'',
			'ufn':false,
			'ua':req.headers['user-agent'],
			'hp':3,
			'freeze': false,
		};
	}
	
	
	
	
	
	var cx = player.x;
	if (cx > 900) cx=900;
	if (cx < 0) cx=0;
	var cy = player.y;
	if (cy > 900) cy=900;
	if (cy < 0) cy=0;
	
	clients[req.cookies['uid']].x = cx;
	clients[req.cookies['uid']].y = cy;
	
	if (clients[req.cookies.uid].ufn) {
		clients[req.cookies.uid].prn = clients[req.cookies.uid].namea;
		clients[req.cookies['uid']].namea = clients[req.cookies.uid].fn;
	} else {
		if (clients[req.cookies.uid].prn!=undefined) {
			clients[req.cookies['uid']].namea = prn;
			clients[req.cookies.uid].prn=undefined;
		} else {
			clients[req.cookies['uid']].namea = player.namea.toString().substring(0,gameConfig.mnl);
		}
	}
	
	clients[req.cookies['uid']].dead = false;
	clients[req.cookies['uid']].tsl = 0;
	clients[req.cookies['uid']].facing = player.facing;
	
	if (bossmode) {
		res.send({'a':clients, 'b': gameConfig, 'c':custom, 'bm':true});
	} else {
		res.send({'a':clients,'b':gameConfig,'c':custom});
	}

});

app.post('/cpanelget', (req, res) => {

	res.send({'a':clients,'b':gameConfig,'c':custom});
});

app.post('/custcss', (req, res) => {
	
	var x;
	if (req.body.data==undefined) x=''; else x=req.body.data;
	
	while (x.includes('\n')) {
		x=x.replace('\n','');
	}
	
	con.log('/custcss: '+x);

	try {
		custom.css=x;
		res.send(true);
	} catch(data) {
		con.error('/custcss: '+data);
		res.send(false);
	}
});







app.post('/projectile', function(req, res) {
	/* Post here to send a projectile */
	try {
	var cuid = Number(req.cookies['uid']);
	
	var gen = clients[cuid];
	
	if (Number(Date.now())>=gen.ttn) {
	var o = {
	
		'type':'projectile',
		'dir':gen.facing,
		'owner':cuid,
		'noshow':false,
		'dead':false,
		'life':gameConfig.projectiletime
	
	}
	

	
	switch (gen.facing) {
	
		case 'left':
			o.x = gen.x+25;
			o.y = gen.y+25;
			break;

		case 'right':
			o.x = gen.x;
			o.y = gen.y+25;
			break;
			
		case 'up':
			o.x = gen.x+25;
			o.y = gen.y+25;
			break;
		
		case 'down':
			o.x = gen.x+25;
			o.y = gen.y;
			break;
			
		default:
			throw 'direction is wrong: '+gen.facing;
			break;
	} 
	if (Math.random()<gameConfig.blurplechance) {o.dir='blurple';}	
	gen.ttn = Number(Date.now())+gameConfig.spamfactor;
		
	var p = 0;	
	while (clients[p]!=undefined&&clients[p]!=null) {
		p++;
	}
	clients[p]=o;
	clients[req.cookies.uid].projsent++;
	res.send(true);
	} else {
		res.send(false);
	}
	} catch(data) {
		
		con.error('Projectile error: '+data);
		res.send(false);
	}
});

function tick() {
	/* here you can see poorly optimized crap that i'm never going to fix */
	for (key in clients) {

		if (clients[key]!=undefined&&clients[key]!=null) {
			if (clients[key].type=="player") {
				clients[key].tsl=clients[key].tsl+gameConfig.gameSpeed;
				if (clients[key].tsl>heartbeat) {
					clients[key].dead=true;
					if (clients[key].tsl>heartbeat+10000) {
						clients[key]=null;
					}
				}
				
				
	
			} 
			if (clients[key]!=undefined&&clients[key]!=null) {
				if (clients[key].type=='projectile') {
			
					clients[key].life=clients[key].life-gameConfig.gameSpeed;	
					
					if ((clients[key].x<(0-100))||clients[key].x>1001||(clients[key].y<(0-100))||clients[key].y>1001||clients[key].life<0) {
						clients[key].noshow=true;
						clients[key].dead=true;
						delete clients[key];
					} else {
						for (k in clients) {
							if (!(clients[k]==undefined||clients[k]==null)) {
								if (clients[k].type=='player'||clients[k].type=='boss') {
									if ((x = (dpc(clients[k].x,clients[k].y,clients[k].uid)))) {
										if (clients[k].score==undefined) {clients[k].score=0;}
										delete clients[x];								
									}				
								}
							}
						}
					}
				
					if (clients[key]!=null) {			
						switch (clients[key].dir) {
				
							case 'left':
								clients[key].x = clients[key].x-gameConfig.distInTick;
								break;
					
							case 'right':
								clients[key].x = clients[key].x+gameConfig.distInTick;
								break;
								
							case 'up':
								clients[key].y = clients[key].y-gameConfig.distInTick;
								break;
						
							case 'down':
								clients[key].y = clients[key].y+gameConfig.distInTick;
								break;
							
							case 'blurple':
								clients[key].x = clients[key].x+(Math.floor(Math.random()*gameConfig.distInTick*4)-gameConfig.distInTick*2);
								clients[key].y = clients[key].y+(Math.floor(Math.random()*gameConfig.distInTick*4)-gameConfig.distInTick*2);
								break;
						}
						
				
					}	
			
			} else if (clients[key].type=='boss') {
				/* boss behavior time */
				
				
				var informativeName = ['left','right','up','down'];
					
				if (Number(Date.now())>=boss.ttn) {
				for (var facing=0; facing<4; facing++) {
				
				

					var facing2 = informativeName[facing];
					
					
					
					try {	
						var o = {
						
							'type':'projectile',
							'dir':facing2,
							'owner':'[BOSS]',
							'noshow':false,
							'dead':false,
							'life':gameConfig.projectiletime
						
						}
						
						
						var p = 0;	
						while (clients[p]!=undefined&&clients[p]!=null) {
							p++;
						}
						
						clients[p]=o;
						console.log(o);
						} catch(data) {
							
							con.error('Boss projectile error:'+data);
						}
					
				}
				
				boss.ttn=gameConfig.spamFactor+Number(Date.now());
				
				}
				
				var name_that_tells_you_stuff = 100;
				
				/* was going to do a math.random thing with name_that_tells_you_stuff but then I realized that this goes every 500ms so I nerfed the boss :\ */
				
				function check(a) {
				
					if (a<0) a=0;
					if (a>900) a=900;
					
					return a;
				}
				
				switch (informativeName[Math.floor(Math.random()*informativeName.length)]) {

					case 'left':
						boss.x = check(boss.x-name_that_tells_you_stuff);
						break;
				
					case 'right':
						boss.x = check(boss.x+name_that_tells_you_stuff);
						break;
								
					case 'up':
						boss.y = check(boss.y-name_that_tells_you_stuff);
						break;
						
					case 'down':
						boss.y = check(boss.y+name_that_tells_you_stuff);
						break;							
				}
				
			}
		}	
	}	
	}
} /* now that's a lotta curly brackets */



var tickInterval = setInterval(tick, gameConfig.gameSpeed);















/* so far I haven't done much with changesettings, but I will soon. */
app.post('/cs', function(req, res) {

	try {
		if (req.body.gm!=undefined) {
			try {
				if (clients[req.cookies['uid']].godmode==undefined) {
					clients[req.cookies['uid']].godmode=true;
				} else {
					clients[req.body.gm].godmode = !clients[req.body.gm].godmode;
				}
				res.send(clients[req.body.gm].godmode);
			} catch(data) {
				con.error(data);
				res.send('error');
			}
		}
		
		if (req.body.ncp!=undefined&&req.body.ncu!=undefined) {
			clients[req.body.ncp].fn=req.body.ncu;
			res.send(true);
		}
		
		if (req.body.ufn!=undefined) {
			console.log(req.body.ufn);
			console.log(JSON.stringify(clients[req.body.ufn]))
			if (clients[req.body.ufn].ufn==undefined) {
				clients[req.body.ufn].ufn=true;
			}
			clients[req.body.ufn].ufn=!clients[req.body.ufn].ufn;
			res.send(clients[req.body.ufn].ufn);
		}
		
		if (req.body.freeze!=undefined) {
			clients[req.body.freeze].freeze=true;
			res.send(clients[req.body.freeze].freeze);
		}
		
		
			} catch(data) {
		con.error('changeSettings: '+data);
		res.send(false);
	}
});


/* prints a message to console.  idk why I actually made this */
app.post('/con', function(req, res) {
	var erro = req.body.erro;
	var inf = req.body.inf;
	var lo = req.body.lo;
	var war = req.body.war;

	if (erro!=undefined) con.error("/con: \""+erro+"\"");
	if (inf!=undefined) con.info("/con: \""+inf+"\"");
	if (lo!=undefined) con.log("/con: \""+lo+"\"");
	if (war!=undefined) con.warn("/con: \""+war+"\"");

	res.send();

});

app.post('/spamfactor', (req, res) => {
	if (Number(req.body.data) !== NaN) {
		gameConfig.spamfactor = Number(req.body.data);
	}
	
	res.send(true);
});

app.post('*', function(req,res) {
	con.info('Got a POST request at '+req.path+', but there\'s nothing there.');
	res.status(404).send();
})

app.get('*', function(req, res) {
	res.status(404).redirect("/");
});






/*

previous code: 


var socket = io();
socket.on("shoutbox", doSomething);

var shoutbox = document.getElementById("shoutbox");
var css=document.createElement("style");
document.head.appendChild(css);

socket.on("csschange",function(data) {
    css.innerHTML=data;
});


function doSomething(data) {
    shoutbox.innerText="Latest shout: "+data;
}
*/



/*

left = 37
up = 38
right = 39
down = 40

*/


/*

	ok I have no idea how but when I change the field's top and left values it automatically
	adjusts the player + otherplayer's top and left values
	
	and when I change the field's height/width, if I have the player/otherplayer's
	height/width at a percentage, they change too
	
	even though they're both position: absolute
	
	this is glorious
	
	I guess adding an offset feature will be easier than I thought
	 
	
	i'm not complainin' 🤷‍♂️

	:D


*/


// Configuration Variables

const levelOfFeedback = 5;
const playerSize = 100;
const minping = 10;

var offset = [00,0];


// Variables

var doot = new Audio('doot.mp3');

var serverConfig = {

	gameSpeed: 100,
	distInTick: 20,
	spamfactor: 500,
	mnl: 11

};
var prevBoss;
var up = false;
var down = false;
var right = false;
var left = false;
var thr = false;
var inBossMode = false;
var latestData;
var ot;
var player = {
		"element":document.querySelector('.player'),
		"x":500,
		"y":500,
		"uid":document.cookie.match(/uid=\d+/).toString().match(/\d+/).toString(),
		"namea":document.cookie.match(/uid=\d+/).toString().match(/\d+/).toString(),
		'facing':'up',
		'dead':'false',
		'tsl':0,
		'type':'player',
		'score':0,
		'hit':0,
		'sentProjectiles':0,
		'godmode':false,
		'fn':false,
		'hp':50,
		'freeze':false
	};
var bossObject;
var otherPlayers = {};
var numOfOthers = 0;
var m = 0;
var ping = minping;
var pinglower = 0;
// Element Variables

const field = document.querySelector('.field');
const nameInput = document.querySelector('.namer');
const info = document.querySelector('.info');
const title = document.querySelector('title');
const bossInfo = document.querySelector('.boss');

// Functions

var con = {"log":function(a){if (levelOfFeedback>3) {console.log(" ["+Date().substring(16,24)+"] "+a);}},"warn":function(a){if (levelOfFeedback>2) {console.warn(" ["+Date().substring(16,24)+"] "+a);}},"error":function(a){if (levelOfFeedback>1) {console.error(" ["+Date().substring(16,24)+"] "+a);}},"info":function(a){if (levelOfFeedback>0) {console.info(" ["+Date().substring(16,24)+"] "+a);}}}

function setOffset(x,y) {
	
	offset=[x,y];

	field.style.left=offset[0]+'px';	
	field.style.top=offset[1]+'px';

	
	
	
}

function cpc(e,x,y) {

	var changedX = Number(e.x)+x;
	var changedY = Number(e.y)+y;

	if (changedX > (1000-playerSize)) changedX = (1000-playerSize);
	if (changedX < 0) changedX = 0;
	if (changedY > (1000-playerSize)) changedY = (1000-playerSize);
	if (changedY < 0) changedY = 0;

	e.element.style.left=(Number(changedX)/10)+'%';
	e.element.style.top=(Number(changedY)/10)+'%';


	e.x = changedX;
	e.y = changedY;

	tellServerThings();
}

function cpcContainer(e,x,y) {
	if (!otherPlayerThere(x,y)) cpc(e,x,y);
}

function spc(e,x,y) {
	var cx = x;
	var cy = y;

	if (cx>(1000-playerSize)) cx=(1000-playerSize);
	if (cx<0) cx=0;
	if (cy>(1000-playerSize)) cy=(1000-playerSize);
	if (cy<0) cy=0;

	e.element.style.left=cx/9+"%";
	e.element.style.top=cy/9+"%";



	e.x=cx;
	e.y=cy;

	tellServerThings();

}

function tellServerThings() {
	$h.sendPost('/','playera='+JSON.stringify(player), function() {
		useServerData(this.response);
	});
}

function useServerData(datb) {

	var data = JSON.parse(datb);
	latestData = data;
	numOfOthers = 0;
	serverConfig = data.b;
	var oPD = data.a;
	
	for (players in oPD) {
		if (!(oPD[players]==undefined||oPD[players]==null)) {
		
		if (!(oPD[players].uid==player.uid)&&(oPD[players].type=='player')) {

			if (!otherPlayers[players]) {

				otherPlayers[players]=oPD[players];

			}

			otherPlayers[players].namea=oPD[players].namea;

			otherPlayers[players].x=oPD[players].x;

			otherPlayers[players].y=oPD[players].y;

			otherPlayers[players].dead=oPD[players].dead;

			otherPlayers[players].tsl = oPD[players].tsl;

			otherPlayers[players].facing = oPD[players].facing;
			if (!oPD[players].dead) {
				numOfOthers ++;
			}

		} else if (oPD[players].type=='projectile') {
			if (otherPlayers[players]==undefined) {
				otherPlayers[players]=oPD[players];
			}
			otherPlayers[players].x=oPD[players].x;
			otherPlayers[players].y=oPD[players].y;
			otherPlayers[players].dir=oPD[players].dir;
			otherPlayers[players].owner=oPD[players].owner;
			otherPlayers[players].noshow=oPD[players].noshow;
		} else if (oPD[players].type=='player'&&oPD[players].uid==player.uid) {
			player.ttn=oPD[players].ttn;
			player.score=oPD[players].score;
			player.hit=oPD[players].hit;
			player.sentProjectiles=oPD[players].projsent;
			player.fn = oPD[players].fn;
			player.ufn = oPD[players].ufn;	
			player.hp = oPD[players].hp;		
			player.freeze = oPD[players].freeze;
		} else if (oPD[players].type=='boss') {
			
			if (!otherPlayers[players]) {
				otherPlayers[players]=oPD[players];
			}

			otherPlayers[players].x=oPD[players].x;

			otherPlayers[players].y=oPD[players].y;

			otherPlayers[players].hp = oPD[players].hp;

			otherPlayers[players].dead=oPD[players].dead;

			if (!inBossMode) {
				bossmode(oPD[players].nameb);
			}
		}
		
		}
		
	}
	
	for (key in otherPlayers) {
		if (oPD[key]==null||oPD[key]==undefined) {
			delete otherPlayers[key];
		}
	}
	
	
	
	if (ot!=numOfOthers&&!inBossMode) {
	
		if (numOfOthers==0) {
			title.innerText = 'dodgeball - playing alone';
		} else if (numOfOthers==1) {
			title.innerText = 'dodgeball - in a 1v1';
		} else if (numOfOthers>1) {
			title.innerText = 'dodgeball - facing '+numOfOthers+' other players';
		} else {
			title.innerText = 'dodgeball has encountered an error';
		}
		
	} else if (inBossMode) {
		title.innerText='dodgeball - BOSS FIGHT!';
	}

	
	document.getElementById('cs').innerHTML=data.c.css;
	
	
	if (inBossMode) {
		innerHealth.innerText=player.hp+'HP';
		if (data.bm==undefined) {
			bossIsDead(); 
		}
	} 


	ot = numOfOthers;
	
	updateInfo();
	
	renderStuff();
}














function renderStuff() {


	for ( var x = 0; x <  field.children.length; x++) {
		var escaper = false;
		for (key in otherPlayers) {
			if (field.children[x]==otherPlayers[key].element) escaper=true;
		}

		if (field.children[x]==player.element) escaper=true;

		if (!escaper) field.removeChild(field.children[x]);
	}
	
	for (key in otherPlayers) {
		if (!(otherPlayers[key]==null||otherPlayers[key]==undefined)) { 
			if (otherPlayers[key].type=='player'&&!otherPlayers[key].dead) {
				if (!otherPlayers[key].element) {
					otherPlayers[key].element=document.createElement('div');
					otherPlayers[key].element.classList.add('otherPlayer');
					otherPlayers[key].element.width=playerSize/10+'%';
					otherPlayers[key].element.height=playerSize/10+'%';
				if (otherPlayers[key].namea!=otherPlayers[key].uid) {
					otherPlayers[key].element.innerText=otherPlayers[key].namea;
				} else {
					otherPlayers[key].element.innerText=key;
				}
				    field.appendChild(otherPlayers[key].element);
				}
			
				if (otherPlayers[key].namea!=otherPlayers[key].uid) {
					otherPlayers[key].element.innerText=otherPlayers[key].namea+'\n\nFacing:\n'+otherPlayers[key].facing;
				} else {
					otherPlayers[key].element.innerText=key+'\n\n Facing:\n'+otherPlayers[key].facing;
				}
			
				switch (otherPlayers[key].facing) {
				
					case ("up"): 
						otherPlayers[key].element.style.transform="rotate(0deg)";
						break;
						
					case ("right"):
						otherPlayers[key].element.style.transform="rotate(90deg)";
						break;
						
					case ('down'):
						otherPlayers[key].element.style.transform="rotate(180deg)";
						break;
						
					case ('left'):
						otherPlayers[key].element.style.transform="rotate(-90deg)";
						break;
						
					default: 
						otherPlayers[key].element.style.transform="rotate(0deg)";
				
				}	
				
				
				otherPlayers[key].element.style.left=Number(otherPlayers[key].x)/10+'%';
				otherPlayers[key].element.style.top=Number(otherPlayers[key].y)/10+'%';
							otherPlayers[key].element.setAttribute('uid',key);
			} else if (otherPlayers[key].type=="projectile") {
			
			
				if (!otherPlayers[key].element) {
					otherPlayers[key].element=document.createElement('div');
					otherPlayers[key].element.classList.add('projectile');
					field.appendChild(otherPlayers[key].element);
				}
			

				
				otherPlayers[key].element.style.left=Number(otherPlayers[key].x)/10+'%';
				otherPlayers[key].element.style.top=Number(otherPlayers[key].y)/10+'%';
		
				if (otherPlayers[key].noshow==true) {
					otherPlayers[key].element.style.visibility="hidden";
				} else {
					otherPlayers[key].element.style.visibility="visible";
				}
				
				if (otherPlayers[key].dead==true) {
					otherPlayers[key].element=undefined;
				}
			
			
			
			} else if (otherPlayers[key].type=='boss'&&otherPlayers[key].dead!=true) {
				
				if (!otherPlayers[key].element) {
					otherPlayers[key].element=document.createElement('div');
					otherPlayers[key].element.classList.add('otherPlayer');
					otherPlayers[key].element.width=playerSize/10+'%';
					otherPlayers[key].element.height=playerSize/10+'%';
					otherPlayers[key].element.innerText='[BOSS]\nHP:'+otherPlayers[key].hp;
				    field.appendChild(otherPlayers[key].element);
				}
				
				otherPlayers[key].element.innerText='[BOSS]\nHP:'+otherPlayers[key].hp;
				otherPlayers[key].element.style.left=Number(otherPlayers[key].x)/10+'%';
				otherPlayers[key].element.style.top=Number(otherPlayers[key].y)/10+'%';
				otherPlayers[key].element.setAttribute('uid', key);
			
			
				
			
			} else {
				if (otherPlayers[key].tsl < 10000) {
					otherPlayers[key].element.classList.add('deadish');
					otherPlayers[key].element.style.opacity=0;
					otherPlayers[key].element.innerText='(Disconnected)\n'+otherPlayers[key].namea;
				} else {
					field.removeChild(otherPlayers[key].element);				
				}
			}
		} /* end of giant if */
	} /* end of for loop */
				player.element.setAttribute('uid',player.uid);
} /* end of function */



function otherPlayerThere(x,y) {
	for (key in otherPlayers) {
		if (otherPlayers[key].x==(player.x+x)&&otherPlayers[key].y==(player.y+y)&&otherPlayers[key].dead==false) return true;
	}
	return false;
}




function tP() {
	if (Number(player.ttn)<=Date.now()) {
		$h.sendPost('/projectile','',function() {
			if (this.response=='true') {
				player.sentProjectiles++;
			}
		});
	}
}













function dooter() {
	doot.play();
}

var health;
var innerHealth;


function bossmode(a) {

	inBossMode=true;
	prevBoss=a;
	dooter();
	bossInfo.innerHTML='        	<h1>Random boss: "<span class=\'bossname\'> this hasn\'t been filled yet, nice</span>"</h1><h2>You now have health.</h2><h3>Land 10 hits on the boss to win.</h3>';
	
	bossInfo.style.top='50px';
	document.querySelector('.bossname').innerHTML=a;
	setTimeout(() => {
		bossInfo.style.top='-500px';
	}, 10000);
	
	health = document.createElement('div');
	health.classList.add('health');
		
	document.body.appendChild(health);
	
	innerHealth = document.createElement('span');
	innerHealth.classList.add('innerHealth');
	health.appendChild(innerHealth);
}

function bossIsDead() {
	
	
	doot.pause();
	inBossMode=false;
	
	bossInfo.innerHTML='<br><br><br>Defeated "'+prevBoss+'"!<br><br><br>';
	bossInfo.style.top='50px';
	
	
	
	setTimeout(() => {
		bossInfo.style.top='-500px';
	}, 10000);
	
	document.body.removeChild(health);
	health.removeChild(innerHealth);
	
	health = undefined;
	innerHealth = undefined;
}












function updateInfo() {

	document.querySelector('.score').innerText='Score: '+player.score;
	document.querySelector('.hit').innerText='Amount of times hit: '+player.hit;
	document.querySelector('.sent').innerText='Amount of projectiles sent: '+player.sentProjectiles;
	document.querySelector('.kdr').innerText='Score/hit ratio: '+(Number(player.score)/Number(player.hit));
	document.querySelector('.acc').innerText='Accuracy: '+Math.floor((player.score/player.sentProjectiles)*100)+'%';
	if (player.ufn==true) {
		document.querySelector('.namedisplay').innerText=player.fn+' (Force)';
	} else {
		document.querySelector('.namedisplay').innerText=player.namea;
	}
	document.querySelector('.fac').innerText=player.facing;
	document.querySelector('.x').innerText=player.x;
	document.querySelector('.y').innerText=player.y;
	
	document.querySelector('.score2').innerText='Score: '+player.score;
	document.querySelector('.hit2').innerText='Times hit: '+player.hit;
	
}



function showButts() {
	// show buttons, get your mind out of the gutter
	document.querySelector('.o').style.opacity=0;
	document.querySelector('.mobutts').style.opacity=1;
	var mb = document.querySelector('.mobutts');
	
	field.style.right='51%';
	info.style.display='none';
	mb.style.left='51%';
	mb.style.top='20%';
	nameInput.style.display='none';
	mb.style.bottom='20%';
	field.style.top='20%';
	field.style.bottom='20%';
	
	
}

function lefta() {
	left = true;
	cpcContainer(player, -100, 0);
	player.facing='left';
}

function upa() {
	up = true;
	if (up) {
	cpcContainer(player,0,-100);
	player.facing='up';
	}
}

function righta() {
	right = true;
	if (right) {
	cpcContainer(player,100,0);
	player.facing='right';
	}
}

function downa() {
	down = true;
	if (down) {
	cpcContainer(player,0,100);
	player.facing='down';
	}
}
			
			
function throwa() {
	thr = true;
	if (thr) {
		tP();
	}
}

addEventListener('mouseup', () => {
	left=false;
	up=false;
	right=false;
	down=false;
	thr=false;
});

document.querySelector('.buttup').addEventListener('mousedown',upa);

document.querySelector('.buttright').addEventListener('mousedown',righta);

document.querySelector('.buttdown').addEventListener('mousedown',downa)

document.querySelector('.buttleft').addEventListener('mousedown',lefta);

document.querySelector('.throwbutt').addEventListener('mousedown',throwa);

document.querySelector('.name2').addEventListener('input',() => {
	player.namea=document.querySelector('.name2').value.substring(0,11);
	document.querySelector('.name2').value=document.querySelector('.name2').value.substring(0,11);
});


function nameSubmit() {
	if (nameInput.value!='You') {
		player.namea=nameInput.value.substring(0,11);
	}
	nameInput.value = nameInput.value.substring(0,11);
}
// Event listeners




addEventListener("keydown", (e) => {
	if (!player.freeze) {
	switch (e.keyCode) {
		case (37):
		//left
			cpcContainer(player,-100,0);
			player.facing='left';
			break;
		case (38):
		//up
			cpcContainer(player,0,-100);
			player.facing='up';
			break;
		case (39):
		//right
			cpcContainer(player,100,0);
			player.facing='right';
			break;
		case (40):
		//down
			cpcContainer(player,0,100);
			player.facing='down';
			break;
			
		case (32):
			tP();
			break;
			
			
	}
	}
});

document.querySelector('.o').addEventListener('click',showButts);

nameInput.addEventListener("input", nameSubmit);

// Startup

function onPing() {

	
	var t0 = performance.now();
	tellServerThings();
	var t1 = performance.now();

	if ((t1-t0) > 3) {
		ping = ping + (t1-t0);
		clearInterval(pinger);
		pinger = setInterval(onPing, ping);
	} else if ((ping-(t1-t0)) > minping) {
		pinglower++;
	}
	
	if (pinglower>=10&&minping>=20) {
		ping = ping - pinglower;
		pinglower=0;
		clearInterval(pinger);
		pinger = setInterval(onPing, ping);
	}

	

}

var pinger = setInterval(onPing,ping);


setInterval(() => {

		if (left) {
			cpcContainer(player,-100,0);
			player.facing='left';
		}
		if (up) {
			cpcContainer(player,0,-100);
			player.facing='up';
		}
		if (right) {
			cpcContainer(player,100,0);
			player.facing='right';
		}
		if (down) {
			cpcContainer(player,0,100);
			player.facing='down';
		}
		if (thr) {
			tP();
		}
			


}, 500);


tellServerThings();

//field.style.left=offset[0]+'px';
//field.style.top=offset[1]+'px';

player.element.style.height=playerSize/10+'%';
player.element.style.width=playerSize/10+'%';

player.element.classList.remove('player');



nameInput.value='You';




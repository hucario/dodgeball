




// Configuration Variables

const levelOfFeedback = 5;
const playerSize = 100;
const minping = 10;

var offset = [0,0];

// Element Variables

const field = document.querySelector('.field');
const title = document.querySelector('title');
const content = document.querySelector('.content');
const outerlist1 = document.querySelector('.outerlist1');
const cs = document.querySelector('.css');
const cStyles = document.getElementById('custyle');
const message = document.querySelector('.msg');
const li = document.querySelector('.outerlist2');
// Variables


var serverConfig = {

	gameSpeed: 100,
	distInTick: 20,
	spamfactor: 500,
	mnl: 11

};

var listings = {};


var latestData;
var ot;

var otherPlayers = {};
var m = 0;
var ping = minping;
var pinglower = 0;

// Functions

var con = {"log":function(a){if (levelOfFeedback>3) {console.log(" ["+Date().substring(16,24)+"] "+a);}},"warn":function(a){if (levelOfFeedback>2) {console.warn(" ["+Date().substring(16,24)+"] "+a);}},"error":function(a){if (levelOfFeedback>1) {console.error(" ["+Date().substring(16,24)+"] "+a);}},"info":function(a){if (levelOfFeedback>0) {console.info(" ["+Date().substring(16,24)+"] "+a);}}}

function msg(x,y) {

	message.innerText=x;
		message.style.top='5%';
	setTimeout(() => {
		message.style.top='-5%';
	}, (y*1000));
	
	con.log(x);

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
	cpc(e,x,y);
}


function tellServerThings() {
	$h.sendPost('/cpanelget','', function() {
		useServerData(this.response);
	});
}



function useServerData(datb) {

	var data = JSON.parse(datb);
	latestData = data;
	serverConfig = data.b;
	
	var oPD = data.a;
	
	for (players in oPD) {
		if (!(oPD[players]==undefined||oPD[players]==null)) {
		if (oPD[players].type=='player') {

			if (!otherPlayers[players]) {

				otherPlayers[players]=oPD[players];

			}

			otherPlayers[players].namea=oPD[players].namea;

			otherPlayers[players].x=oPD[players].x;

			otherPlayers[players].y=oPD[players].y;

			otherPlayers[players].dead=oPD[players].dead;

			otherPlayers[players].tsl = oPD[players].tsl;

			otherPlayers[players].facing = oPD[players].facing;

			otherPlayers[players].godmode = oPD[players].godmode;
			
			otherPlayers[players].ua = oPD[players].ua;

		} else if (oPD[players].type=='projectile') {
			if (otherPlayers[players]==undefined) {
				otherPlayers[players]=oPD[players];
			}
			otherPlayers[players].x=oPD[players].x;
			otherPlayers[players].y=oPD[players].y;
			otherPlayers[players].dir=oPD[players].dir;
			otherPlayers[players].owner=oPD[players].owner;
			otherPlayers[players].noshow=oPD[players].noshow;
		}
		
		
		}

	}
	
	for (key in otherPlayers) {
		if (oPD[key]==null||oPD[key]==undefined) {
			delete otherPlayers[key];
		}
	}
	
	
	
	renderStuff();
}







function renderStuff() {


	for ( var x = 0; x <  field.children.length; x++) {
		var escaper = false;
		for (key in otherPlayers) {
			if (field.children[x]==otherPlayers[key].element) escaper=true;
		}


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
				
				if (!listings[key]) {
					listings[key]={};
				}
				
				if (!listings[key].main) {
					listings[key].main=document.createElement('div');
					listings[key].main.classList.add('listing');
					li.appendChild(listings[key].main);
				}
				
				if (!listings[key].playerPreview) {
					listings[key].playerPreview=document.createElement('div');
					listings[key].playerPreview.classList.add('otherPlayer');
					listings[key].playerPreview.classList.add('listingplayer');
				if (otherPlayers[key].namea!=otherPlayers[key].uid) {
					listings[key].playerPreview.innerText=otherPlayers[key].namea;
				} else {
					listings[key].playerPreview.innerText=key;
				}
				
					listings[key].main.appendChild(listings[key].playerPreview);
					listings[key].playerPreview.style.width=Number(getComputedStyle(listings[key].playerPreview).height.substring(0,Number(getComputedStyle(listings[key].playerPreview).height.length)-2))+'px';
				}
				
				if (!listings[key].playerInfo) {
					listings[key].playerInfo={};
				}
				
				
				if (!listings[key].playerInfo.main) {
					listings[key].playerInfo.main = document.createElement('div');
					listings[key].playerInfo.main.classList.add('playerInfo');
					listings[key].main.appendChild(listings[key].playerInfo.main)
					listings[key].playerInfo.main.style.width=(Number(getComputedStyle(listings[key].main).width.substring(0,Number(getComputedStyle(listings[key].main).width.length)-2))-Number(getComputedStyle(listings[key].playerPreview).height.substring(0,Number(getComputedStyle(listings[key].playerPreview).height.length)-2))-2)+'px';	
					
				}
				
				if (!listings[key].playerInfo.xy) {
					listings[key].playerInfo.xy = document.createElement('span');
					listings[key].playerInfo.xy.style.float='right';
					listings[key].playerInfo.xy.innerText='('+otherPlayers[key].x+','+otherPlayers[key].y+')';

					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.xy);
				}
				
				
				if (!listings[key].playerInfo.godButton) {
				
					listings[key].playerInfo.godButton = document.createElement('button');
					listings[key].playerInfo.godButton.innerText='Godmode: FALSE';
					let op = key;
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.godButton);
					listings[key].playerInfo.godButton.addEventListener('click', () => {
						$h.sendPost('/cs','gm='+op,function() {
							if (this.response!='error') {
								msg('toggled godmode for \''+otherPlayers[op].namea+'\' to '+this.response,5);
							} else {
								msg('failed to toggle godmode for \''+otherPlayers[op].namea+'\'',5);
							}
							
							listings[op].playerInfo.godButton.innerText='Godmode: '+this.response.toUpperCase();
							
						});
					});
				
				}
				
				if (!listings[key].playerInfo.br1) {
					listings[key].playerInfo.br1 = document.createElement('br');
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.br1);
				}
				
				if (!listings[key].playerInfo.namea) {
				
					listings[key].playerInfo.namea = document.createElement('input');
					listings[key].playerInfo.namea.value = otherPlayers[key].namea;
					
					let up = key;
					
					listings[key].playerInfo.namea.addEventListener('input', () => {
					
						$h.sendPost('/cs','ncp='+up+'&ncu='+listings[up].playerInfo.namea.value);
						console.log(listings[up].playerInfo.namea.value);
					});
									
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.namea);
				
				}
				
				if (!listings[key].playerInfo.ufn) {
				
					listings[key].playerInfo.ufn = document.createElement('button');
					listings[key].playerInfo.ufn.innerText='FALSE';
					let opr = key;
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.ufn);
					listings[key].playerInfo.ufn.addEventListener('click', () => {
						$h.sendPost('/cs','ufn='+opr,function() {
						msg('toggled using fname for \''+otherPlayers[opr].namea+'\' to '+this.response,5);
						listings[opr].playerInfo.ufn.innerText=this.response.toUpperCase();
							
						});
					});
				
				}
				
				
				
				if (!listings[key].playerInfo.br2) {
					listings[key].playerInfo.br2 = document.createElement('br');
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.br2);
				}
				
				if (!listings[key].playerInfo.uar) {
					listings[key].playerInfo.uar = document.createElement('span');
					listings[key].playerInfo.uar.innerText=otherPlayers[key].ua;
					
					listings[key].playerInfo.uar.style.fontSize = '10px';
					
					listings[key].playerInfo.main.appendChild(listings[key].playerInfo.uar);
				}

				
				
				
				if (otherPlayers[key].namea!=otherPlayers[key].uid) {
					listings[key].playerPreview.innerText=otherPlayers[key].namea+'\n(#'+otherPlayers[key].uid+')';
				} else {
					listings[key].playerPreview.innerText=key;
				}

					otherPlayers[key].element.innerText=key;

			
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
				
				otherPlayers[key].element.setAttribute('uid',key);
				
				otherPlayers[key].element.style.left=Number(otherPlayers[key].x)/10+'%';
				otherPlayers[key].element.style.top=Number(otherPlayers[key].y)/10+'%';
			
				listings[key].playerInfo.xy.innerText='('+otherPlayers[key].x+','+otherPlayers[key].y+')';
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				

			
			
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
			
			
			
			} else {
				if (otherPlayers[key]===undefined || otherPlayers[key]=== null) {} else 
				if (otherPlayers[key].tsl < 10000) {
						listings[key].classList.add('deadish');
						listings[key].style.opacity=0;
						listings[key].playerPreview.innerText='(Disconncted)\n'+otherPlayers[key].namea;
						otherPlayers[key].element.classList.add('deadish');
						otherPlayers[key].element.style.opacity=0;
						otherPlayers[key].element.innerText='(Disconnected)\n'+otherPlayers[key].namea;
				} else if (otherPlayers[key].tsl > 10000&&otherPlayers[key].tsl < 12000) {
					listings[key].style.height='0px';
					field.removeChild(otherPlayers[key].element);
				} else if (otherPlayers[key].tsl > 10000&&otherPlayers[key].tsl > 12000) {
					li.removeChild(listings[key]);
				}
			}
		} /* end of giant if */
	} /* end of for loop */
} /* end of function */








/* Event Listeners */

document.querySelector('.cstop').addEventListener('click', () => {
	$h.sendPost('/custcss', 'data='+cs.value, function() {
		if (this.response=='true') {
			msg('sent succ',5);
		} else {
			msg('sent unsucc',5);
		}
	});
	
	cStyles.innerHTML=cs.value;
});






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


tellServerThings();
field.style.height=getComputedStyle(field).width;
outerlist1.style.width=getComputedStyle(field).width;
document.querySelector('.outerCSS').style.height=Number(getComputedStyle(field).width.substring(0,Number(getComputedStyle(field).width.length)-2))+'px';
document.querySelector('.outerCSS').style.width=Number(getComputedStyle(content).width.substring(0,Number(getComputedStyle(content).width.length)-2))-Number(getComputedStyle(field).width.substring(0,Number(getComputedStyle(field).width.length)-2))+'px';

setTimeout(() => {
cs.style.height=(Number(getComputedStyle(document.querySelector('.outerCSS')).height.substring(0,Number(getComputedStyle(document.querySelector('.outerCSS')).height.length)-2))-20)+'px'
}, 550);
cs.focus();
document.querySelector('.outerlist2').style.top=(Number(getComputedStyle(field).width.substring(0,Number(getComputedStyle(field).height.length)-2))+(Number(getComputedStyle(content).top.substring(0,Number(getComputedStyle(content).top.length)-2)))+1)+'px';



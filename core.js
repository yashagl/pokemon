/**
 * Core
 * Created by CreaturePhil - https://github.com/CreaturePhil
 *
 * This is where essential core infrastructure of
 * Pokemon Showdown extensions for private servers.
 * Core contains standard streams, profile infrastructure,
 * elo rating calculations, and polls infrastructure.
 *
 * @license MIT license
 */

var fs = require("fs");
var path = require("path");

var core = exports.core = {

	stdin: function (file, name) {
		var data = fs.readFileSync('config/' + file + '.csv', 'utf8').split('\n');

		var len = data.length;
		while (len--) {
			if (!data[len]) continue;
			var parts = data[len].split(',');
			if (parts[0].toLowerCase() === name) {
				return parts[1];
			}
		}
		return 0;
	},

	stdout: function (file, name, info, callback) {
		var data = fs.readFileSync('config/' + file + '.csv', 'utf8').split('\n');
		var match = false;

		var len = data.length;
		while (len--) {
			if (!data[len]) continue;
			var parts = data[len].split(',');
			if (parts[0] === name) {
				data = data[len];
				match = true;
				break;
			}
		}

		if (match === true) {
			var re = new RegExp(data, 'g');
			fs.readFile('config/' + file + '.csv', 'utf8', function (err, data) {
				if (err) return console.log(err);

				var result = data.replace(re, name + ',' + info);
				fs.writeFile('config/' + file + '.csv', result, 'utf8', function (err) {
					if (err) return console.log(err);
					typeof callback === 'function' && callback();
				});
			});
		} else {
			var log = fs.createWriteStream('config/' + file + '.csv', {
				'flags': 'a'
			});
			log.write('\n' + name + ',' + info);
			typeof callback === 'function' && callback();
		}
	},

	profile: {

		color: '#2ECC40',

		avatarurl: 'http://cbc.pokecommunity.com/config',

		avatar: function (online, user, img) {
			if (online === true) {
				if (typeof (img) === typeof ('')) {
					return '<img src="' + this.avatarurl + '/avatars/' + img + '" width="80" height="80" align="left">';
				}
				return '<img src="http://play.pokemonshowdown.com/sprites/trainers/' + img + '.png" width="80" height="80" align="left">';
			}
			for (var name in Config.customAvatars) {
				if (user === name) {
					return '<img src="' + this.avatarurl + '/avatars/' + Config.customAvatars[name] + '" width="80" height="80" align="left">';
				}
			}
			var trainersprites = [1, 2, 101, 102, 169, 170, 265, 266, 168];
			return '<img src="http://play.pokemonshowdown.com/sprites/trainers/' + trainersprites[Math.floor(Math.random() * trainersprites.length)] + '.png" width="80" height="80" align="left">';
		},

		name: function (online, user) {
			if (online === true) {
				return '&nbsp;<strong><font color="' + this.color + '">Name:</font></strong>&nbsp;' + user.name;
			}
			return '&nbsp;<strong><font color="' + this.color + '">Name:</font></strong>&nbsp;' + user;
		},

		group: function (online, user) {
			if (online === true) {
				if (user.group === ' ') {
					return '<br>&nbsp;<strong><font color="' + this.color + '">Group:</font></strong>&nbsp;' + 'Regular User';
				}
				return '<br>&nbsp;<strong><font color="' + this.color + '">Group:</font></strong>&nbsp;' + Config.groups[user.group].name;
			}
			var g = Core.stdin('usergroups', user);
			if (g === 0) {
				return '<br>&nbsp;<strong><font color="' + this.color + '">Group:</font></strong>&nbsp;' + 'Regular User';
			}
			return '<br>&nbsp;<strong><font color="' + this.color + '">Group:</font></strong>&nbsp;' + Config.groups[g].name;
		},

		title: function (user) {
			return Core.stdin('title', user);
		},

		bp: function (user) {
			return Core.stdin('bp', user);
		},

		tourWins: function (user) {
			return Core.stdin('tourWins', user);
		},

		pclWins: function (user) {
			return Core.stdin('pclWins', user);
		},

		display: function (args, info) {
			if (args === 'title') return '<div class="profile-title">&nbsp;' + info + '</div>';
			if (args === 'bp') return '<br>&nbsp;<strong><font color="' + this.color + '">Battle Points:</font></strong>&nbsp;' + info;
			if (args === 'tourWins') return '<br>&nbsp;<strong><font color="' + this.color + '">Tournament Wins:</font></strong>&nbsp;' + info;
			if (args === 'pclWins') return '<br>&nbsp;<strong><font color="' + this.color + '">PCL Tournament Wins:</font></strong>&nbsp;' + info;
		},

	},

	ladder: function (limit) {
		var data = fs.readFileSync('config/tourWins.csv', 'utf-8');
		var row = ('' + data).split("\n");

		var list = [];

		for (var i = row.length; i > -1; i--) {
			if (!row[i] || row[i].indexOf(',') < 0) continue;
			var parts = row[i].split(",");
			list.push([toId(parts[0]), Number(parts[1])]);
		}

		list.sort(function (a, b) {
			return a[1] - b[1];
		});

		if (list.length > 1) {
			var ladder = '<table border="1" cellspacing="0" cellpadding="3"><tbody><tr><th>Rank</th><th>User</th><th>Tournament Wins</th></tr>';
			var len = list.length;

			limit = len - limit;
			if (limit > len) limit = len;

			while (len--) {
				ladder = ladder + '<tr><td>' + (list.length - len) + '</td><td>' + list[len][0] + '</td><td>' + Math.floor(list[len][1]) + '</td></tr>';
				if (len === limit) break;
			}
			ladder += '</tbody></table>';
			return ladder;
		}
		return 0;
	},

	pclLadder: function (limit) {
		var data = fs.readFileSync('config/pclWins.csv', 'utf-8');
		var row = ('' + data).split("\n");

		var list = [];

		for (var i = row.length; i > -1; i--) {
			if (!row[i] || row[i].indexOf(',') < 0) continue;
			var parts = row[i].split(",");
			list.push([toId(parts[0]), Number(parts[1])]);
		}

		list.sort(function (a, b) {
			return a[1] - b[1];
		});

		if (list.length > 1) {
			var ladder = '<table border="1" cellspacing="0" cellpadding="3"><tbody><tr><th>Rank</th><th>User</th><th>PCL Tournament Wins</th></tr>';
			var len = list.length;

			limit = len - limit;
			if (limit > len) limit = len;

			while (len--) {
				ladder = ladder + '<tr><td>' + (list.length - len) + '</td><td>' + list[len][0] + '</td><td>' + Math.floor(list[len][1]) + '</td></tr>';
				if (len === limit) break;
			}
			ladder += '</tbody></table>';
			return ladder;
		}
		return 0;
	},

	bpLadder: function (limit) {
		var data = fs.readFileSync('config/bp.csv', 'utf-8');
		var row = ('' + data).split("\n");

		var list = [];

		for (var i = row.length; i > -1; i--) {
			if (!row[i] || row[i].indexOf(',') < 0) continue;
			var parts = row[i].split(",");
			list.push([toId(parts[0]), Number(parts[1])]);
		}

		list.sort(function (a, b) {
			return a[1] - b[1];
		});

		if (list.length > 1) {
			var ladder = '<table border="1" cellspacing="0" cellpadding="3"><tbody><tr><th>Rank</th><th>User</th><th>Battle Points</th></tr>';
			var len = list.length;

			limit = len - limit;
			if (limit > len) limit = len;

			while (len--) {
				ladder = ladder + '<tr><td>' + (list.length - len) + '</td><td>' + list[len][0] + '</td><td>' + Math.floor(list[len][1]) + '</td></tr>';
				if (len === limit) break;
			}
			ladder += '</tbody></table>';
			return ladder;
		}
		return 0;
	},

	shop: function (showDisplay) {
		var shop = [
			['Star', 'Buy a \u2606 to go in front of your name and puts you at the top of the user list. (Goes away if you leave for more than one hour or the server restarts.)', 3],
			['Poof', 'Buy a poof message to be added into your pool of possible poofs. Poofs are custom leave messages.', 20],
			['Fix', 'Buy the ability to alter your current custom avatar. (Don\'t buy this if you don\'t have a custom avatar. If you have a custom avatar and would like to apply it to other usernames, contact the admin "wolf" and don\'t buy this.)', 25],
			['Title', 'Buy a user title for your profile. (Can be seen via "/profile username". Check "/profile wolf" for an example.)', 30],
			['BlackStar', 'Buy a \u2605 to go in front of your name and puts you at the top of the user list. (Lasts for three weeks.)', 40],
			['Avatar', 'Buy a custom avatar to be applied to your name. (You supply. Images larger than 80x80 may not show correctly.)', 50]
		];

		if (showDisplay === false) {
			return shop;
		}

		var s = '<div class="broadcast-lobby"><table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Command</th><th>Description</th><th>Cost</th></tr>';
		var start = 0;
		while (start < shop.length) {
			s = s + '<tr><td>' + shop[start][0] + '</td><td>' + shop[start][1] + '</td><td>' + shop[start][2] + '</td></tr>';
			start++;
		}
		s += '</tbody></table><center>To buy an item from the shop, use the /buy <em>command</em>.</center></div>';
		return s;
	},

	poll: function () {
		var poll = {};
		var components = {

			reset: function (roomId) {
				poll[roomId] = {
					question: undefined,
					optionList: [],
					options: {},
					display: '',
					topOption: ''
				};
			},

			splint: function (target) {
				var parts = target.split(',');
				var len = parts.length;
				while (len--) {
					parts[len] = parts[len].trim();
				}
				return parts;
			}

		};

		for (var i in components) {
			if (components.hasOwnProperty(i)) {
				poll[i] = components[i];
			}
		}

		for (var id in Rooms.rooms) {
			if (Rooms.rooms[id].type === 'chat' && !poll[id]) {
				poll[id] = {};
				poll.reset(id);
			}
		}

		return poll;
	},

	hashColor: function (name) {
		function MD5(e){function t(e,t){var n,r,i,s,o;i=e&2147483648;s=t&2147483648;n=e&1073741824;r=t&1073741824;o=(e&1073741823)+(t&1073741823);return n&r?o^2147483648^i^s:n|r?o&1073741824?o^3221225472^i^s:o^1073741824^i^s:o^i^s}function n(e,n,r,i,s,o,u){e=t(e,t(t(n&r|~n&i,s),u));return t(e<<o|e>>>32-o,n)}function r(e,n,r,i,s,o,u){e=t(e,t(t(n&i|r&~i,s),u));return t(e<<o|e>>>32-o,n)}function i(e,n,r,i,s,o,u){e=t(e,t(t(n^r^i,s),u));return t(e<<o|e>>>32-o,n)}function s(e,n,r,i,s,o,u){e=t(e,t(t(r^(n|~i),s),u));return t(e<<o|e>>>32-o,n)}function o(e){var t="",n="",r;for(r=0;r<=3;r++)n=e>>>r*8&255,n="0"+n.toString(16),t+=n.substr(n.length-2,2);return t}var u=[],a,f,l,c,h,p,d,v,e=function(e){for(var e=e.replace(/\r\n/g,"\n"),t="",n=0;n<e.length;n++){var r=e.charCodeAt(n);r<128?t+=String.fromCharCode(r):(r>127&&r<2048?t+=String.fromCharCode(r>>6|192):(t+=String.fromCharCode(r>>12|224),t+=String.fromCharCode(r>>6&63|128)),t+=String.fromCharCode(r&63|128))}return t}(e),u=function(e){var t,n=e.length;t=n+8;for(var r=((t-t%64)/64+1)*16,i=Array(r-1),s=0,o=0;o<n;)t=(o-o%4)/4,s=o%4*8,i[t]|=e.charCodeAt(o)<<s,o++;i[(o-o%4)/4]|=128<<o%4*8;i[r-2]=n<<3;i[r-1]=n>>>29;return i}(e);h=1732584193;p=4023233417;d=2562383102;v=271733878;for(e=0;e<u.length;e+=16)a=h,f=p,l=d,c=v,h=n(h,p,d,v,u[e+0],7,3614090360),v=n(v,h,p,d,u[e+1],12,3905402710),d=n(d,v,h,p,u[e+2],17,606105819),p=n(p,d,v,h,u[e+3],22,3250441966),h=n(h,p,d,v,u[e+4],7,4118548399),v=n(v,h,p,d,u[e+5],12,1200080426),d=n(d,v,h,p,u[e+6],17,2821735955),p=n(p,d,v,h,u[e+7],22,4249261313),h=n(h,p,d,v,u[e+8],7,1770035416),v=n(v,h,p,d,u[e+9],12,2336552879),d=n(d,v,h,p,u[e+10],17,4294925233),p=n(p,d,v,h,u[e+11],22,2304563134),h=n(h,p,d,v,u[e+12],7,1804603682),v=n(v,h,p,d,u[e+13],12,4254626195),d=n(d,v,h,p,u[e+14],17,2792965006),p=n(p,d,v,h,u[e+15],22,1236535329),h=r(h,p,d,v,u[e+1],5,4129170786),v=r(v,h,p,d,u[e+6],9,3225465664),d=r(d,v,h,p,u[e+11],14,643717713),p=r(p,d,v,h,u[e+0],20,3921069994),h=r(h,p,d,v,u[e+5],5,3593408605),v=r(v,h,p,d,u[e+10],9,38016083),d=r(d,v,h,p,u[e+15],14,3634488961),p=r(p,d,v,h,u[e+4],20,3889429448),h=r(h,p,d,v,u[e+9],5,568446438),v=r(v,h,p,d,u[e+14],9,3275163606),d=r(d,v,h,p,u[e+3],14,4107603335),p=r(p,d,v,h,u[e+8],20,1163531501),h=r(h,p,d,v,u[e+13],5,2850285829),v=r(v,h,p,d,u[e+2],9,4243563512),d=r(d,v,h,p,u[e+7],14,1735328473),p=r(p,d,v,h,u[e+12],20,2368359562),h=i(h,p,d,v,u[e+5],4,4294588738),v=i(v,h,p,d,u[e+8],11,2272392833),d=i(d,v,h,p,u[e+11],16,1839030562),p=i(p,d,v,h,u[e+14],23,4259657740),h=i(h,p,d,v,u[e+1],4,2763975236),v=i(v,h,p,d,u[e+4],11,1272893353),d=i(d,v,h,p,u[e+7],16,4139469664),p=i(p,d,v,h,u[e+10],23,3200236656),h=i(h,p,d,v,u[e+13],4,681279174),v=i(v,h,p,d,u[e+0],11,3936430074),d=i(d,v,h,p,u[e+3],16,3572445317),p=i(p,d,v,h,u[e+6],23,76029189),h=i(h,p,d,v,u[e+9],4,3654602809),v=i(v,h,p,d,u[e+12],11,3873151461),d=i(d,v,h,p,u[e+15],16,530742520),p=i(p,d,v,h,u[e+2],23,3299628645),h=s(h,p,d,v,u[e+0],6,4096336452),v=s(v,h,p,d,u[e+7],10,1126891415),d=s(d,v,h,p,u[e+14],15,2878612391),p=s(p,d,v,h,u[e+5],21,4237533241),h=s(h,p,d,v,u[e+12],6,1700485571),v=s(v,h,p,d,u[e+3],10,2399980690),d=s(d,v,h,p,u[e+10],15,4293915773),p=s(p,d,v,h,u[e+1],21,2240044497),h=s(h,p,d,v,u[e+8],6,1873313359),v=s(v,h,p,d,u[e+15],10,4264355552),d=s(d,v,h,p,u[e+6],15,2734768916),p=s(p,d,v,h,u[e+13],21,1309151649),h=s(h,p,d,v,u[e+4],6,4149444226),v=s(v,h,p,d,u[e+11],10,3174756917),d=s(d,v,h,p,u[e+2],15,718787259),p=s(p,d,v,h,u[e+9],21,3951481745),h=t(h,a),p=t(p,f),d=t(d,l),v=t(v,c);return(o(h)+o(p)+o(d)+o(v)).toLowerCase()}function hslToRgb(e,t,n){var r,i,s,o,u,a;if(!isFinite(e))e=0;if(!isFinite(t))t=0;if(!isFinite(n))n=0;e/=60;if(e<0)e=6- -e%6;e%=6;t=Math.max(0,Math.min(1,t/100));n=Math.max(0,Math.min(1,n/100));u=(1-Math.abs(2*n-1))*t;a=u*(1-Math.abs(e%2-1));if(e<1){r=u;i=a;s=0}else if(e<2){r=a;i=u;s=0}else if(e<3){r=0;i=u;s=a}else if(e<4){r=0;i=a;s=u}else if(e<5){r=a;i=0;s=u}else{r=u;i=0;s=a}o=n-u/2;r=Math.round((r+o)*255);i=Math.round((i+o)*255);s=Math.round((s+o)*255);return{r:r,g:i,b:s}}function rgbToHex(e,t,n){return toHex(e)+toHex(t)+toHex(n)}function toHex(e){if(e==null)return"00";e=parseInt(e);if(e==0||isNaN(e))return"00";e=Math.max(0,e);e=Math.min(e,255);e=Math.round(e);return"0123456789ABCDEF".charAt((e-e%16)/16)+"0123456789ABCDEF".charAt(e%16)}var colorCache={};var hashColor=function(e){if(colorCache[e])return colorCache[e];var t=MD5(e);var n=parseInt(t.substr(4,4),16)%360;var r=parseInt(t.substr(0,4),16)%50+50;var i=parseInt(t.substr(8,4),16)%20+25;var s=hslToRgb(n,r,i);colorCache[e]="#"+rgbToHex(s.r,s.g,s.b);return colorCache[e]}
		return hashColor(name);
	},

	emoticons: {
		':absol:': 'http://cbc.pokecommunity.com/config/emoticons/absol.png',
		':arceus:': 'http://cbc.pokecommunity.com/config/emoticons/arceus.png',
		':armycat:': 'http://cbc.pokecommunity.com/config/emoticons/armycat.png',
		':azelf:': 'http://cbc.pokecommunity.com/config/emoticons/azelf.png',
		':bidoof:': 'http://cbc.pokecommunity.com/config/emoticons/bidoof.png',
		':bye:': 'http://cbc.pokecommunity.com/config/emoticons/bye.gif',
		':castform:': 'http://cbc.pokecommunity.com/config/emoticons/castform.png',
		':catflip:': 'http://cbc.pokecommunity.com/config/emoticons/catflip.png',
		':charizard:': 'http://cbc.pokecommunity.com/config/emoticons/charizard.png',
		':clown:': 'http://cbc.pokecommunity.com/config/emoticons/clown.png',
		':cookie:': 'http://cbc.pokecommunity.com/config/emoticons/cookie.png',
		':dk:': 'http://cbc.pokecommunity.com/config/emoticons/dk.png',
		':electrode:': 'http://cbc.pokecommunity.com/config/emoticons/electrode.png',
		':espurr:': 'http://cbc.pokecommunity.com/config/emoticons/espurr.png',
		':ew:': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzI3MDc3NzM3Nzg3Nzc3NzA3N//AABEIAC4ALAMBIgACEQEDEQH/xAAaAAEBAQEAAwAAAAAAAAAAAAAGBQQHAAID/8QAMRAAAgEDAwMBBgQHAAAAAAAAAQMCBAURAAYSEyExIgc1QVF1tCMyQoEUFlJhcZXU/8QAFgEBAQEAAAAAAAAAAAAAAAAAAQAD/8QAHxEAAwACAQUBAAAAAAAAAAAAAAECAxESMVFhoeEh/9oADAMBAAIRAxEAPwDptJeL/cIvdQWe2Spl1T6eEn3NkJy6TZLJMQiQGTAnGT516Xb+b661VlHT0FppHVCJqXULu7uSZSiQJjFOO4Jz5HjWvZvuio+qXD7t2pdhue6LvR2y5l9jRR1ghM05S0s4nyIz5gE48enURM2Ztvc+1JVkKahss6aoivjTwuTVwXOPLlMDoEZkDEH+0B5+CNtfudQzOz2b/bt/5tbRfrVOKSm4UrOuubFcWgicYHEpD5gHzo/ar9O83a6rhNbKNBRKmnD9cWKE8k/Hz20JaWkNN09sQbcujbxao1b6eFO3rOTNUGlkRJbZrOJGMcg8M+B51T0f2L7hn9Rr/u3aQaQIezfdFR9UuH3btCtk22y2VFspq7aFVC9ojFba1lv5wiwfrDDkAduxGlVup9y2pVRTU1utNQmVZUvW1lyYuRi102DMQiWCBPHk+NZL5Xbmt9srblVWq0yTSIm9kV3RhkYwiZHGacDOBqI5yNnbkiBOKRFinvtyeLBiNI0tJcBntgtHbziA7af2K2Qt90uxSt0FTKILE4AQ4wVGI4nJyPgcgdx++sO3twXy/wBTVU9HZrdCdMtbGda5zAxMzAAwg9/wzn/I18areD6a5stnTs9RWqiZNTRVtVUyWBLieXSpZcSD2IPcdvmNCpNbGk5eqFuxfcM/qNf927SDUHY8OG3FS/iaKp61TUv6lC/rJ/EeyeIzwOWOWD2HcHV7SB5o97QnFWyrwuKptZVU5o1QhjJY7CoeSABymMnPjOkOj3tCRB+x751OWU0TKhcoTMTBix1ISBBByJRif21Mn4OV2i+yoxf0JfOir7rOktlO4KZMJcWsg0c44iGLizkPUM4BGRq1ufeFNTptlLU0yLSkGlalTJy508Vz9clLWkyEZrMljqFZI5DhH1Zn+xxNo3TU7i6tK6dKErX03slnLg2LZ9pfnlECJn+bGRnuc79xeymuuF7lcF1FPVzlxJY1/QMzHtHnApbGZ4xjkjjE/wBA+OETSlJ9Azc6t8v1Pt9Kns3uPUuy1pvKrvCuoWPqamCwsFqprETwj2hPg4RlnuQtfjGukaIbXsm4Ke/Mul8ZbVA0QpymgmyQdPkDzkZCOBHBER6iOpPv81+tMcuZ0wnGsa4p79H/2Q==',
		':flirt:': 'http://cbc.pokecommunity.com/config/emoticons/flirt.png',
		':gav:': 'http://cbc.pokecommunity.com/config/emoticons/gav.png',
		':gloom:': 'http://cbc.pokecommunity.com/config/emoticons/gloom.png',
		':growlithe:': 'http://cbc.pokecommunity.com/config/emoticons/growlithe.png',
		':hamster:': 'http://cbc.pokecommunity.com/config/emoticons/hamster.png',
		':helix:': 'http://cbc.pokecommunity.com/config/emoticons/helix.png',
		':houndoom:': 'http://cbc.pokecommunity.com/config/emoticons/houndoom.png',
		':jigglypuff:': 'http://cbc.pokecommunity.com/config/emoticons/jigglypuff.png',
		':jynx:': 'http://cbc.pokecommunity.com/config/emoticons/jynx.png',
		':kappa:': 'http://cbc.pokecommunity.com/config/emoticons/kappa.png',
		':keepo:': 'http://cbc.pokecommunity.com/config/emoticons/keepo.png',
		':kermit:': 'http://cbc.pokecommunity.com/config/emoticons/kermit.png',
		':kreygasm:': 'http://cbc.pokecommunity.com/config/emoticons/kreygasm.png',
		':lapras:': 'http://cbc.pokecommunity.com/config/emoticons/lapras.png',
		':lileep:': 'http://cbc.pokecommunity.com/config/emoticons/lileep.png',
		':ludicolo:': 'http://cbc.pokecommunity.com/config/emoticons/ludicolo.png',
		':luvdisc:': 'http://cbc.pokecommunity.com/config/emoticons/luvdisc.png',
		':magikarp:': 'http://cbc.pokecommunity.com/config/emoticons/magikarp.png',
		':meganium:': 'http://cbc.pokecommunity.com/config/emoticons/meganium.png',
		':meowstic:': 'http://cbc.pokecommunity.com/config/emoticons/meowstic.png',
		':meowsticf:': 'http://cbc.pokecommunity.com/config/emoticons/meowsticf.png',
		':metagross:': 'http://cbc.pokecommunity.com/config/emoticons/metagross.png',
		':moo:': 'http://cbc.pokecommunity.com/config/emoticons/moo.gif',
		':nw:': 'http://cbc.pokecommunity.com/config/emoticons/nw.gif',
		':oddish:': 'http://cbc.pokecommunity.com/config/emoticons/oddish.png',
		':pear:': 'http://cbc.pokecommunity.com/config/emoticons/pear.png',
		':pjsalt:': 'http://cbc.pokecommunity.com/config/emoticons/pjsalt.png',
		':pogchamp:': 'http://cbc.pokecommunity.com/config/emoticons/pogchamp.png',
		':potato:': 'http://cbc.pokecommunity.com/config/emoticons/potato.png',
		':psyduck:': 'http://cbc.pokecommunity.com/config/emoticons/psyduck.png',
		':pyoshi:': 'http://cbc.pokecommunity.com/config/emoticons/pyoshi.png',
		':seduce:': 'http://cbc.pokecommunity.com/config/emoticons/seduce.png',
		':senpai:': 'http://cbc.pokecommunity.com/config/emoticons/senpai.png',
		':sims:': 'http://cbc.pokecommunity.com/config/emoticons/sims.png',
		':slowpoke:': 'http://cbc.pokecommunity.com/config/emoticons/slowpoke.png',
		':snorlax:': 'http://cbc.pokecommunity.com/config/emoticons/snorlax.png',
		':spheal:': 'http://cbc.pokecommunity.com/config/emoticons/spheal.png',
		':sri:': 'http://cbc.pokecommunity.com/config/emoticons/sri.png',
		':strut:': 'http://cbc.pokecommunity.com/config/emoticons/strut.png',
		':suicune:': 'http://cbc.pokecommunity.com/config/emoticons/suicune.png',
		':superman:': 'http://cbc.pokecommunity.com/config/emoticons/superman.png',
		':anrin:': 'data:image/jpeg;base64,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',
		':sweep:': 'http://cbc.pokecommunity.com/config/emoticons/sweep.gif',
		':taco:': 'http://cbc.pokecommunity.com/config/emoticons/taco.png',
		':lol:': 'data:image/jpeg;base64,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',
		':vulpix:': 'http://cbc.pokecommunity.com/config/emoticons/vulpix.png',
		':aeerca:': 'data:image/jpeg;base64,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',
		':weezing:': 'http://cbc.pokecommunity.com/config/emoticons/weezing.png',
		':why:': 'http://cbc.pokecommunity.com/config/emoticons/why.png',
		':wobbuffet:': 'http://cbc.pokecommunity.com/config/emoticons/wobbuffet.png',
		':wooper:': 'http://cbc.pokecommunity.com/config/emoticons/wooper.png',
		':wynaut:': 'http://cbc.pokecommunity.com/config/emoticons/wynaut.png',
		':y:': 'http://cbc.pokecommunity.com/config/emoticons/y.png',
		':yoshi:': 'http://cbc.pokecommunity.com/config/emoticons/yoshi.png'
	},

	processEmoticons: function (text) {
		var patterns = [],
			metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g,
			self = this;

		for (var i in this.emoticons) {
			if (this.emoticons.hasOwnProperty(i)) {
				patterns.push('(' + i.replace(metachars, "\\$&") + ')');
			}
		}

		return text.replace(new RegExp(patterns.join('|'), 'g'), function (match) {
			if (match === ':gav:' || match === ':kermit:' || match === ':nw:' || match === ':superman:' || match === ':sweep:' || match === ':yoshi:') return typeof self.emoticons[match] != 'undefined' ?
				'<img src="' + self.emoticons[match] + '" title="' + match + '" width="30" height="30"/>' :
				match;
			if (match === ':catflip:') return typeof self.emoticons[match] != 'undefined' ?
				'<img src="' + self.emoticons[match] + '" title="' + match + '" width="44" height="32"/>' :
				match;
			if (match === ':strut:') return typeof self.emoticons[match] != 'undefined' ?
				'<img src="' + self.emoticons[match] + '" title="' + match + '" width="23" height="33"/>' :
				match;
			return typeof self.emoticons[match] != 'undefined' ?
				'<img src="' + self.emoticons[match] + '" title="' + match + '"/>' :
				match;
		});
	},

	processChatData: function (user, room, connection, message) {
		var match = false;
		
		for (var i in this.emoticons) {
			if (message.indexOf(i) >= 0) {
				match = true;
			}
		}
		if (!match || message.charAt(0) === '!') return true;
		message = Tools.escapeHTML(message);
		message = this.processEmoticons(message);
		room.add('|raw|<div class="chat"><strong><font color="' + Core.hashColor(user.userid)+'"><small>' + user.group + '</small><span class="username" data-name="' + user.group + user.name + '">' + user.name + '</span>:</font></strong> <em class="mine">' + message + '</em></div>');
		return false;
	},

	tournaments: {
		tourSize: 8,
		amountEarn: 10,
		earningBP: function () {
			if (this.amountEarn === 10) return '<u>Standard (8 players = 1 Battle Point)</u> Double (4 players = 1 Battle Point) Quadruple (2 players = 1 Battle Point) PC Custom (1 player = 1 Battle Point)';
			if (this.amountEarn === 4) return 'Standard (8 players = 1 Battle Point) <u>Double (4 players = 1 Battle Point)</u> Quadruple (2 players = 1 Battle Point) PC Custom (1 player = 1 Battle Point)';
			if (this.amountEarn === 2) return 'Standard (8 players = 1 Battle Point) Double (4 players = 1 Battle Point) <u>Quadruple (2 players = 1 Battle Point)</u> PC Custom (1 player = 1 Battle Point)';
			if (this.amountEarn === 1.5) return 'Standard (8 players = 1 Battle Point) Double (4 players = 1 Battle Point) Quadruple (2 players = 1 Battle Point) <u>PC Custom (1 player = 1 Battle Point)</u>';
		}
	},

};

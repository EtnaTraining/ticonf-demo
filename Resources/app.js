// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');


//var hostname = '192.168.1.106:8080';
var hostname = 'ead9bf0b0db339287591e2dafc86c4ebc6676099.cloudapp-preview2.appcelerator.com:80';
//var uri = 'ws://ead9bf0b0db339287591e2dafc86c4ebc6676099.cloudapp-preview2.appcelerator.com:80';
var uri = 'ws://' + hostname;


function loadPolls(_cb) {
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		//Ti.API.info(xhr.responseText);
		_cb(JSON.parse(xhr.responseText));
	};
	xhr.onerror = function(e) {
		alert(JSON.stringify(e));
	}
	xhr.open("GET", 'http://' + hostname);
	xhr.send();
}


if (Ti.Platform.osname == "mobileweb") {
	var io = require('socket.io.client');
} else {
	var io = require('socket.io');
}
var socket = io.connect(uri);

socket.on('connect', function() {
	Ti.API.log('connected!')
});


var win = Ti.UI.createWindow({
	backgroundColor : '#232323',
	layout: "vertical"
});

var question = Ti.UI.createLabel({
	top: 10,
	width: "90%",
	height: 40,
	color: "white"
	//borderWidth: 1,
	//borderColor: "black"
});
win.add(question);

var answerViews = [];

function vote(e) {
	//Ti.API.info(e.source.choice);
	socket.emit('vote', {question: 0, answer: e.source.choice});
	//Ti.API.info(JSON.stringify(answerViews[e.source.choice].children[0]));
	answerViews[e.source.choice].children[0].width++;
	answerViews[e.source.choice].children[1].text++;
	
} 

loadPolls(function(polls) {
	//Ti.API.info(JSON.stringify(polls));
	question.text = polls[0].question;
	for (var i = 0; i < polls[0].answers.length; i++) {
		Ti.API.info(polls[0].answers[i]);
		win.add(Ti.UI.createLabel({
			top: 0,
			width: "90%",
			height: 30,
			color: "white",
			//borderWidth: 1,
			//borderColor: "black",
			text: polls[0].answers[i]
		}));
		var chartView = Ti.UI.createView({
			top: 0,
			width: "90%",
			height: 30,
			backgroundImage:"track-complete.png"
		});
		var answer = Ti.UI.createLabel({
			top: 0,
			width: "90%",
			height: 30,
			//borderWidth: 1,
			//borderColor: "black",
			color: "white",
			//backgroundImage:"track-complete.png",
			//backgroundColor: "black",
			textAlign: "center",
			text: polls[0].values[i]
		});
		var progressImageView = Ti.UI.createImageView({
			top:1,
			height:28,
			left:1,
			width: polls[0].values[i],
			borderRadius:3,
			backgroundImage: "color" + i + ".png"
		});
		
		chartView.add(progressImageView);
		chartView.add(answer);
		answerViews.push(chartView);
		win.add(chartView);	
	}
	var btnBar = Ti.UI.createView({
		top: 10,
		height: 100,
		width: "95%",
		layout: "horizontal",
		//borderWidth: 1
	});
	
	
	for (var i = 0; i < polls[0].answers.length; i++) {
		Ti.API.info(polls[0].answers[i]);
		var btn = Ti.UI.createButton({
			top: 5,
			left: 10,
			width: "30%",
			height: 40,
			//borderWidth: 1,
			//borderColor: "black",
			title: polls[0].answers[i],
			choice: i
		});
		btnBar.add(btn);
		btn.addEventListener('click', vote);	
	}
	win.add(btnBar);
	
});

socket.on('results', function(data) {
		//Ti.API.info(JSON.stringify(data));
		answerViews[data.answer].children[0].width = data.votes;
		answerViews[data.answer].children[1].text = data.votes;
});



win.open();





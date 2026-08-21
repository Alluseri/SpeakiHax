if (!window.gameState) {
	alert("SpeakiMod is not installed correctly or the game updated! Can't proceed.");
	throw "Injection error...";
}

const Emotes = {
	Cry: 1,
	Jump: 2,
	PumpkinJoayo: 3,
	StrokeStart: 4,
	StrokeStage2: 5,
	StrokeBloom: 6,
	StrokeCancel: 7,
	Dance: 8
};

function buildElement(tag, characteristics, inner, callback) {
	var elem = document.createElement(tag);
	elem.replaceChildren(...(inner?.filter(t => t) || []));
	for (let _ in (characteristics || {})) {
		elem[_] = characteristics[_];
	}
	if (callback) callback(elem);
	return elem;
}

var lunHudElements = {
	playersNearby: null,
	expTrackerL1: null,
	expTrackerL2: null,
	channelTracker: null
};

var lunTickCount = 0;
var lunTickTime = 50;
var lunExpTrackerWindow = 60000 / lunTickTime;
var lunExpTrackerNextTicks = 0;
var lunExpTrackerStartExp = gameState.myStat.exp;
var lunExpTrackerSpeed = 0;

var lunChannelTrackerWindow = 7500 / lunTickTime;
var lunChannelTrackerNextTicks = 0;

var lunCameraLocked = false;
var lunViewClip = false;

document.head.appendChild(buildElement(
	"style",
	{
		id: "spkmod-stylesheet",
		innerHTML: `
		#spkmod-hud {
			display: flex;
			flex-direction: row;
			gap: 4px;
			position: absolute;
			top: 225px;
			left: 5px;
			z-index: 500000;
			color: #EEE;
		}
		#spkmod-main {
			display: flex;
			flex-direction: column;
			gap: 1px;
			background-color: #000C;
			border: 4px solid #DDD;
			border-radius: 8px;
			padding: 6px;
		}
		#spkmod-panel {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		#spkmod-header, #spkmod-texpb {
			border-bottom: 1px solid #DDD;
			margin-bottom: 4px;
		}
		.spkmod-panel-btn {
			color: #EEE;
			background-color: #000C;
			border: 4px solid #DDD;
			border-radius: 8px;
			padding: 5px;
			font-size: 11pt;
			cursor: pointer;
			outline: none;
		}
		.spkmod-watch-player-btn {
			color: #FFF;
			border-color: #333;
			box-shadow: 0 .1875rem 0 #333;
			background: #000;
		}
		`
	}
));

document.body.appendChild(
	buildElement("div", {
		id: "spkmod-hud"
	}, [
		buildElement("div", {
			id: "spkmod-main"
		}, [
			buildElement("span", {
				id: "spkmod-header",
				innerText: "SpeakiMod v1.0.0"
			}),
			lunHudElements.playersNearby = buildElement("span", {
				innerText: "Players nearby: 0"
			}),
			lunHudElements.expTrackerL1 = buildElement("span", {
				innerText: "0 EXP per minute"
			}),
			lunHudElements.expTrackerL2 = buildElement("span", {
				id: "spkmod-texpb",
				innerText: "Until next level: N/A"
			}),
			lunHudElements.channelTracker = buildElement("span", {
				innerText: "Channel tracker: N/A"
			})
		]),
		buildElement("div", {
			id: "spkmod-panel"
		}, [
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Dance",
				value: "",
				onclick: e => {
					gameState.sendEmoteNow(Emotes.Dance);
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Joayo",
				value: "",
				onclick: e => {
					gameState.sendEmoteNow(Emotes.PumpkinJoayo);
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Reset Camera",
				value: "",
				onclick: e => {
					watchPlayer();
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "Lock Camera",
				value: "",
				onclick: e => {
					lunCameraLocked = !lunCameraLocked;
					e.target.innerText = lunCameraLocked ? "Unlock Camera" : "Lock Camera";
				}
			}),
			buildElement("button", {
				className: "spkmod-panel-btn",
				innerText: "ViewClip OFF",
				value: "",
				onclick: e => {
					lunViewClip = !lunViewClip;
					e.target.innerText = lunViewClip ? "ViewClip ON" : "ViewClip OFF";
				}
			})
		])
	])
);

function chatLog(msg) {
	gameState.chatBox.append(-1337, "SpeakiMod", msg);
}

function watchPlayer(name) {
	if (name) {
		var pi = Object.values(Object.fromEntries(gameState.remotePlayers.remotePlayers)).find(t => t.info.name == name);
		if (pi) {
			gameState.cameraController.target = pi.container;
			chatLog("The camera will be following " + name + " now.");
			return;
		} else {
			chatLog("Couldn't find the target player. The camera will be following you now.");
		}
	} else {
		chatLog("The camera will be following you now.");
	}

	gameState.cameraController.target = gameState.playerContainer;
}

var hPartyTarget = document.querySelector(".sr-party-target");
if (hPartyTarget) {
	hPartyTarget.insertBefore(
		buildElement("button", {
			className: "sr-btn sr-party-target__btn spkmod-watch-player-btn",
			innerText: "[SM] Watch",
			value: "",
			onclick: e => {
				watchPlayer(e.target.parentElement.querySelector(".sr-party-target__name").innerText);
			}
		}),
		hPartyTarget.querySelector(".sr-party-target__close")
	)
} else {
	alert("Warning: Couldn't find party target element. The Watch functionality will only be available through chat commands. Mod loaded too early?");
}

function tick() {
	lunTickCount++;

	var authToken = gameState.socket.socket.url.substring(gameState.socket.socket.url.indexOf("access_token=") + "access_token=".length);
	var playerExp = gameState.myStat.exp;

	lunHudElements.playersNearby.innerText = "Players nearby: " + gameState.remotePlayers.remotePlayers.size;

	if (lunExpTrackerStartExp > playerExp || lunTickCount >= lunExpTrackerNextTicks) {
		lunExpTrackerSpeed = (playerExp - lunExpTrackerStartExp) / lunExpTrackerWindow * (1000 / lunTickTime);

		lunExpTrackerNextTicks = lunTickCount + lunExpTrackerWindow;
		lunExpTrackerStartExp = playerExp;
	}

	if (lunExpTrackerSpeed > 0) {
		lunHudElements.expTrackerL1.innerText = (lunExpTrackerSpeed * 60).toFixed(2) + " EXP per minute";
		lunHudElements.expTrackerL2.innerText = "Until next level: ~" + ((gameState.myStat.maxExp - playerExp) / lunExpTrackerSpeed / 60).toFixed(2) + " min";
	} else {
		lunHudElements.expTrackerL1.innerText = "0 EXP per minute";
		lunHudElements.expTrackerL2.innerText = "Until next level: N/A";
	}

	if (lunTickCount >= lunChannelTrackerNextTicks) {
		fetch("https://sr1.overture.io.kr/api/realtime/channels", {
			"method": "GET",
			"headers": {
				"authorization": "Bearer " + authToken
			},
			"mode": "cors"
		}).then(async x => {
			var resp = (await x.json());
			if (!x.ok) {
				lunHudElements.channelTracker.innerText = "Channel tracker: N/A";
				return;
			}

			lunHudElements.channelTracker.innerText = resp.map(t => `Channel ${t.channel}: ${t.population}/${t.capacity}`).join("\n");
		});

		lunChannelTrackerNextTicks = lunTickCount + lunChannelTrackerWindow;
	}
}

var hkComputeCameraTargetPosition = gameState.cameraController.computeCameraTargetPosition.bind(gameState.cameraController);
gameState.cameraController.computeCameraTargetPosition = function (pos) {
	if (!lunCameraLocked)
		return hkComputeCameraTargetPosition(pos);
}

var hkCameraControllerGetObstacles = gameState.cameraController.getObstacles.bind(gameState.cameraController);
gameState.cameraController.getObstacles = function () {
	return lunViewClip ? [] : hkCameraControllerGetObstacles();
}

var hkTrySendChat = gameState.trySendChat.bind(gameState);
gameState.trySendChat = function (msg) {
	if (msg.startsWith("!")) {
		var cmd = msg.substring(1).split(" ");
		switch (cmd[0]) {
			case "watch":
				watchPlayer(cmd[1]);
				break;
			case "zoom":
				if (!cmd[1]) {
					chatLog("Usage: !zoom [number]");
					chatLog("Legitimate values range from 3 to 12. Higher value = farther camera.");
					return;
				}

				chatLog("Set camera zoom to " + (gameState.cameraController.cameraZoomDistance = Number.parseInt(cmd[1]) || 12) + "!");
				break;
			default:
				chatLog("Unknown command: " + cmd[0]);
				chatLog("Available commands: watch, zoom");
				break;
		}
		return;
	}

	return hkTrySendChat(msg);
}

setInterval(tick, 50);

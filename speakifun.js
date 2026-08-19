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

const Actions = {
	Idle: 0,
	Follow: 1,
	Ritual: 2,
	Dance: 3,
	Cry: 4
};

// TODO: Can both be used at once?
const SecondaryActions = {
	None: 0,
	Jump: 1,
	Pat: 2
};

const Yggdrasil = {
	x: 44,
	y: 0,
	z: 50
};

const MinYggGap = 5;

var lunBotId = 0;
var lunBotCount = 0;

var lunStatusScreen = document.createElement("span");
lunStatusScreen.style.position = "absolute";
lunStatusScreen.style.top = "325px";
lunStatusScreen.style.left = "0px";
lunStatusScreen.style.zIndex = "500000";
lunStatusScreen.style.color = "#07F";
lunStatusScreen.innerText = "SpeakiFun OFF";
document.body.appendChild(lunStatusScreen);

function getPlayerPos() {
	return gameState.playerContainer.position;
}

function distanceToVector(vec) {
	var ep = getPlayerPos();

	return Math.hypot(vec.x - ep.x, vec.z - ep.z);
}

function normalizeVector(x, y) {
	let n = Math.sqrt(x * x + y * y);
	return n < 1e-6 ? {
		x: 0,
		z: 0
	} : {
		x: x / n,
		z: y / n
	}
}

var lunAction = Actions.Idle;
var lunSecondary = SecondaryActions.None;
var lunTargetPlayer = 0;
var lunMoveTarget = null;
var lunTickCount = 0;
var lunSpeedMultiplier = 1;

clearInterval(FUN_LOOP);
function tick() {
	lunTickCount++;

	gameState.scenery.staticCollidersList = [];
	gameState.pumpkinManager.getColliders = () => [];
	gameState.monsters.buildColliders = () => [];
	gameState.cameraController.getObstacles = () => [];

	switch (lunAction) {
		case Actions.Idle: break;
		case Actions.Cry:
			if (lunTickCount > sec(20)) {
				gameState.sendEmoteNow(Emotes.Cry);
				lunTickCount = 0;
			}
			break;
		case Actions.Dance:
			if (lunTickCount > sec(20)) {
				gameState.sendEmoteNow(Emotes.Dance);
				lunTickCount = 0;
			}
			break;
		case Actions.Follow:
			var tp = gameState.remotePlayers.remotePlayers.get(lunTargetPlayer);
			if (!tp) {
				lunTargetPlayer = 0;
				lunMoveTarget = null;
				lunAction = Actions.Idle;
				return;
			}

			lunMoveTarget = tp.container.position;
			break;
		case Actions.Ritual:
			var offset = 2 * Math.PI / lunBotCount * lunBotId;
			var base = (lunTickCount / (20 * 5)) * lunSpeedMultiplier;
			var xof = Math.sin(base + offset) * (MinYggGap + 1.5);
			var zof = Math.cos(base + offset) * (MinYggGap + 1.5);

			// If this doesn't work I'll hardcode it to use teleport ngl
			//lunMoveTarget = {
			teleport({
				x: Yggdrasil.x + xof,
				y: Yggdrasil.y,
				z: Yggdrasil.z + zof
			});
			break;
	}

	if (lunTickCount % 5 == 0) {
		switch (lunSecondary) {
			case SecondaryActions.None: break;
			case SecondaryActions.Jump: gameState.sendEmoteNow(Emotes.Jump); break;
			case SecondaryActions.Pat: gameState.sendEmoteNow(Emotes.StrokeBloom); break;
		}
	}
}
var FUN_LOOP = setInterval(tick, 50);

function sec(t) {
	return t * 50;
}

function chatLog(msg) {
	gameState.chatBox.append(-1337, "SpeakiFun", msg);
}

function teleport(pos) {
	gameState.playerContainer.position.x = pos.x;
	gameState.playerContainer.position.z = pos.z;
}

var hkUpdate = gameState.update.bind(gameState);
gameState.update = function (moveSpeed, t, n) {
	return hkUpdate(moveSpeed * lunSpeedMultiplier, t, n);
}

/*
Global player command ideas:
- #stop (stop)
- #here (follow the player)
- #dance (stop and dance)
- #pat (spam affection bloom)
- #jump (start jumping)
- #cry (stop and cry)
- #ritual (spin around Yggdrasil)
- #speed (speed the bots up slightly)
*/

var hkHandleChat = gameState.handleChat.bind(gameState);
gameState.handleChat = function (obm) {
	var playerId = obm.playerId;
	var playerName = obm.playerName;
	var msg = obm.text;

	lunMoveTarget = null;
	lunTickCount = 0;

	switch (msg) {
		case "#stop":
			lunAction = Actions.Idle;
			lunSecondary = SecondaryActions.None;
			break;
		case "#here":
			lunAction = Actions.Follow;
			lunTargetPlayer = playerId;
			break;
		case "#dance":
			lunAction = Actions.Dance;
			lunSecondary = SecondaryActions.None;
			break;
		case "#pat":
			lunSecondary = SecondaryActions.Pat;
			break;
		case "#jump":
			lunSecondary = SecondaryActions.Jump;
			break;
		case "#cry":
			lunAction = Actions.Cry;
			lunSecondary = SecondaryActions.None;
			break;
		case "#ritual":
			lunAction = Actions.Ritual;
			break;
		case "#speed":
			lunSpeedMultiplier = lunSpeedMultiplier == 1 ? 1.5 : 1;
			break;
	}

	return hkHandleChat(obm);
}

var hkCombatAssistUpdate = gameState.combatAssist.update.bind(gameState.combatAssist);
gameState.combatAssist.update = function (e) {
	if (lunMoveTarget) {
		var pp = getPlayerPos();

		return {
			moveDir: normalizeVector(
				lunMoveTarget.x - pp.x,
				lunMoveTarget.z - pp.z
			),
			castSkillId: null
		};
	}

	return hkCombatAssistUpdate(e);
}

function resetHWID() {
	localStorage.clear();
	document.cookie = "sr1_device_id=";
	console.log("HWID reset to newcomer values!");
}

lunBotId = 1;
lunBotCount = 8;

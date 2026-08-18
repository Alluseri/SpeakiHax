const ENTITIES = {
	forest_fairy: "숲의 요정", // l1
	dew_fairy: "이슬 요정", // l3
	sprout_fairy: "새싹 요정", // l5
	beastfolk: "숲 수인 정찰병",
	wind: "떠도는 바람정령",
	breeze: "산들 바람정령",
	toad: "이끼등 두꺼비"
};
var TARGET_ENTITY = ENTITIES.forest_fairy;
const PORTAL_POS_LVL0 = {
	x: 95,
	y: 0,
	z: 50
};
const PORTAL_POS_LVL1 = {
	x: 105,
	y: 0,
	z: 50
};
const BOT_STATES = {
	Sleep: -1,
	Farming: 0,
	Retreating: 1
};
const EMOTES = {
	Cry: 1,
	Jump: 2,
	PumpkinJoayo: 3,
	StrokeStart: 4,
	StrokeStage2: 5,
	StrokeBloom: 6,
	StrokeCancel: 7,
	Dance: 8
};

// TODO: Check skill availability
// RangeM is hardcoded from Dl declarations
const SKILL_SLOT_ORDER = [
	/*{
		// `잉걸 화구`
		index: 2,
		rangeM: 5
	},
	{
		// `뿌리 내려찍기`
		index: 1,
		rangeM: 4
	},*/ {
		// `별빛 섬광`
		index: 0,
		rangeM: 3
	}
];

var hxBotState = BOT_STATES.Farming;
var hxCurrentlyTargeting = null;
var hxTickCount = 0;
var hxNextCastTickCount = 0;

var lunTickCount = 0;
var lunPersistentAnimstate = 0;

var hxExpTrackerWindow = 60000 / 50;
var hxExpTrackerNextTicks = 0;
var hxExpTrackerStartExp = 0;
var hxExpTrackerSpeed = 0;

var hxStatusScreen = document.createElement("span");
hxStatusScreen.style.position = "absolute";
hxStatusScreen.style.top = "325px";
hxStatusScreen.style.left = "325px";
hxStatusScreen.style.zIndex = "500000";
hxStatusScreen.style.color = "#F00";
hxStatusScreen.innerText = "SpeakiHax OFF";
document.body.appendChild(hxStatusScreen);

function getAllEntities() {
	return Object.values(Object.fromEntries(gameState.monsters.monsters));
}

function findAllEntitiesOfType(type) {
	return getAllEntities().filter(t => t.info.name == type);
}

function attackEntity(ent) {
	gameState.setTarget(getEntityId(ent));

	gameState.combatAssist.reset();

	if (SKILL_SLOT_ORDER.length && getHP(ent) == ent.info.maxHp && hxTickCount >= hxNextCastTickCount) {
		// Only when have oneshot potential
		// TODO: Logic not exactly perfect, there are cases where skill can oneshot but basic attack can't
		for (let ord of SKILL_SLOT_ORDER) {
			var powerSkill = gameState.skillHotbar.slots[ord.index];
			var pskid = powerSkill.skillId;
			if (gameState.skillHotbar.getRemainingCooldownMs(pskid) <= 0) {
				hxNextCastTickCount = hxTickCount + 10;
				gameState.combatAssist.requestActiveSkillCast(pskid, ord.rangeM);
				// console.log("Using power skill " + ord.index + " for better murder capability");
				break;
			}
		}
	}

	gameState.combatAssist.autoAttackActive = true;
}

function getEntityId(entity) {
	return entity.info.monsterInstanceId;
}

function getHP(entity) {
	return entity.info.currentHp;
}

function isDead(entity) {
	return getHP(entity) <= 0;
}

function getPlayerPos() {
	return gameState.playerContainer.position;
}

function getEntityPos(entity) {
	return entity.container.position;
	/*return {
		x: entity.info.positionX,
		y: entity.info.positionY,
		z: entity.info.positionZ
	};*/
}

function distanceTo(entity) {
	var ep = getPlayerPos();
	var np = getEntityPos(entity);

	return Math.hypot(np.x - ep.x, np.z - ep.z);
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

function getPlayerHP() {
	return gameState.myStat.hp;
}

function tick() {
	lunTickCount++;

	// idk how this shit works tbh but just in case new players don't correctly receive old emotes (I haven't bothered checking on an alt)
	if (lunPersistentAnimstate && lunTickCount % (20 * 6) == 0) {
		gameState.sendEmoteNow(EMOTES.Dance);
	}
}

function botTick() {
	hxTickCount++;

	const playerExp = gameState.myStat.exp;

	hxStatusScreen.innerText = "SpeakiHax Status: " + hxBotState;
	hxStatusScreen.innerText += "\nEXP: " + playerExp + "/" + gameState.myStat.maxExp;
	hxStatusScreen.innerText += "\nTicks: " + hxTickCount;

	if (hxNextCastTickCount > hxTickCount) {
		hxStatusScreen.innerText += " (" + (hxNextCastTickCount - hxTickCount) + " until next cast)";
	}

	if (hxCurrentlyTargeting) {
		hxStatusScreen.innerText += "\nTargeting enemy: " + getEntityId(hxCurrentlyTargeting) + " (" + getHP(hxCurrentlyTargeting) + " HP, " + distanceTo(hxCurrentlyTargeting).toFixed(3) + "m away)";
	}

	/*if (hxTickCount % 20 == 0) {
		gameState.bloomEffects.spawnHearts(gameState.playerContainer);
		gameState.sendEmoteNow(EMOTES.StrokeBloom);
	}*/

	if (hxExpTrackerStartExp > playerExp || hxTickCount >= hxExpTrackerNextTicks) {
		// in seconds
		hxExpTrackerSpeed = (playerExp - hxExpTrackerStartExp) / hxExpTrackerWindow * 20;

		hxExpTrackerNextTicks = hxTickCount + hxExpTrackerWindow;
		hxExpTrackerStartExp = playerExp;
	}

	if (hxExpTrackerSpeed) {
		hxStatusScreen.innerText += "\nTime until next level: ~" + ((gameState.myStat.maxExp - playerExp) / hxExpTrackerSpeed / 60).toFixed(3) + " minutes";
	}

	hxStatusScreen.innerText += "\nNext EXP tracker update in " + ((hxExpTrackerNextTicks - hxTickCount) * 50) + " ms, current EXP gain: " + (hxExpTrackerSpeed * 60).toFixed(3) + "/min";

	// TODO: Actively try to find better targets
	switch (hxBotState) {
		case BOT_STATES.Farming:
			if (getPlayerHP() < 20) {
				hxBotState = BOT_STATES.Retreating;
				hxCurrentlyTargeting = null;
				return;
			} else if (getPlayerHP() < 90 && gameState.potionSlot.getRemainingCooldownMs() <= 0) {
				gameState.tryUsePotion();
			}

			if (!hxCurrentlyTargeting || isDead(hxCurrentlyTargeting)) {
				var allEnemies = findAllEntitiesOfType(TARGET_ENTITY);
				if (!allEnemies.length)
					return;

				var hpSort = allEnemies.filter(t => !isDead(t)).sort((a, b) => getHP(a) - getHP(b));

				if (!hpSort.length)
					return;

				var bhp = getHP(hpSort[0]);
				var hpFlt = hpSort.filter(t => getHP(t) == bhp);
				var ent;

				if (hpFlt.length > 1) {
					hpFlt = hpFlt.sort((a, b) => distanceTo(a) - distanceTo(b));
				}

				ent = hpFlt[0];

				attackEntity(hxCurrentlyTargeting = ent);
				console.log("Targeting enemy with " + getHP(ent) + " HP, distance: " + distanceTo(ent));
			} else if (gameState.targetMonsterId != getEntityId(hxCurrentlyTargeting) || !gameState.combatAssist.autoAttackActive) {
				attackEntity(hxCurrentlyTargeting);
			} else {
				attackEntity(hxCurrentlyTargeting);
			}
			break;
		case BOT_STATES.Retreating:
			if (distanceToVector(PORTAL_POS_LVL1) < 1) {
				hxBotState = BOT_STATES.Sleep;
				// gameState.socket.sendUsePortal(2);
				gameState.tryInteractNearby();
				console.log("Using portal to home");
				setTimeout(() => {
					// gameState.socket.sendUsePortal(1)
					gameState.tryInteractNearby();
					hxBotState = BOT_STATES.Farming;
					console.log("Using portal to level 1");
				}, 2000);
			}
			break;
	}
}

function chatLog(msg) {
	gameState.chatBox.append(-1337, "SpeakiHax", msg);
}

function teleport(pos) {
	gameState.playerContainer.position.x = pos.x;
	gameState.playerContainer.position.z = pos.z;
}

// TODO Command ideas:
// - NoClip
// - HClip
// - AutoBloom
// - Affectionmaxxer
// - Bunnyhop

var hxSpeedMultiplier = 1;

var hkUpdate = gameState.update.bind(gameState);
gameState.update = function (moveSpeed, t, n) {
	return hkUpdate(moveSpeed * hxSpeedMultiplier, t, n);
}

var hkTrySendChat = gameState.trySendChat.bind(gameState);
gameState.trySendChat = function (msg) {
	if (msg.startsWith("!")) {
		var cmd = msg.substring(1).split(" ");
		switch (cmd[0]) {
			case "target":
				var trg = ENTITIES[cmd[1]?.toLowerCase()];
				if (!trg) {
					chatLog("That entity doesn't exist!");
					chatLog("Available entities: beastfolk, wind, breeze, toad.");
					return;
				}

				TARGET_ENTITY = trg;
				chatLog("Now targeting " + cmd[1] + "!");
				break;
			case "mass-inv":
				var maxLevel = Number.parseInt(cmd[1] || "1000");
				Array.from(gameState.remotePlayers.remotePlayers.values()).forEach(p => {
					if (p.info.level <= maxLevel) {
						// TODO: Must have a cooldown/delay otherwise doesn't work properly
						// Register it as an on-tick handler ig
						gameState.socket.sendPartyInvite(p.info.playerId);
						chatLog("Invited " + p.info.name + " (level " + p.info.level + ")!");
					}
				});
				break;
			case "players":
				Array.from(gameState.remotePlayers.remotePlayers.values()).forEach(p => {
					chatLog(p.info.name + " - level " + p.info.level + " (ID " + p.info.playerId + ")");
				});
				break;
			case "speed":
				cmd[1] ||= "1";
				chatLog("New speed multiplier: " + (hxSpeedMultiplier = Number.parseFloat(cmd[1])) + ".");
				break;
			case "pumpkin":
				// TODO: Doesn't send affection update queries
				gameState.sendEmoteNow(EMOTES.PumpkinJoayo);
				chatLog("Joayo!");
				break;
			case "shop":
				gameState.onNerInteract();
				chatLog("Opened the shop!");
				break;
			case "dance":
				if (!lunPersistentAnimstate) {
					lunPersistentAnimstate = EMOTES.Dance;
					gameState.sendEmoteNow(EMOTES.Dance);
					chatLog("Dancing!");
				} else {
					lunPersistentAnimstate = 0;
					chatLog("Stopped dancing!");
				}
				break;
			case "portal":
				switch (cmd[1]) {
					case "0":
						teleport(PORTAL_POS_LVL0);
						chatLog("Teleported to level 0 portal!");
						break;
					default:
						teleport(PORTAL_POS_LVL1);
						chatLog("Teleported to level 1 portal!");
						break;
				}
				break;
			default:
				chatLog("Unknown command: " + cmd[0]);
				chatLog("Available commands: target, mass-inv, players, speed, pumpkin, shop, dance, portal");
				break;
		}
		return;
	}

	return hkTrySendChat(msg);
}

var hkCombatAssistUpdate = gameState.combatAssist.update.bind(gameState.combatAssist);
gameState.combatAssist.update = function (e) {
	if (hxBotState == BOT_STATES.Retreating) {
		var pp = getPlayerPos();

		return {
			moveDir: normalizeVector(
				PORTAL_POS_LVL1.x - pp.x,
				PORTAL_POS_LVL1.z - pp.z
			),
			castSkillId: null
		};
	}

	return hkCombatAssistUpdate(e);
}

var HAX_LOOP = setInterval(tick, 50);
var BOT_LOOP = setInterval(botTick, 50);

function killBot() {
	hxStatusScreen.innerText = "SpeakiHax OFF";
	clearInterval(BOT_LOOP);
	BOT_LOOP = 0;
}

hxStatusScreen.onclick = () => {
	if (BOT_LOOP) {
		killBot();
	} else {
		hxStatusScreen.innerText = "Trying to restart SpeakiHax...";
		hxBotState = 0;
		BOT_LOOP = setInterval(botTick, 50);
	}
};

function resetHWID() {
	localStorage.clear();
	document.cookie = "sr1_device_id=";
	console.log("HWID reset to newcomer values!");
}

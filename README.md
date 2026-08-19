# SpeakiHax
A utility mod™ for the fan-made Speaki RPG

Extremely hardcoded because this is mostly for the memes. Can obviously be weaponized to mass bot servers, etc. I don't really care tho

And you can dance in the lobby!

## Features
This list is not exhaustive, see **Available Commands** for the full list of features.
- Grinding bot (hardcoded, you have to edit the src to make sense of it)
- HUD (toggleable)
- Mass invite all loaded players to party (broken)
- Dump all loaded players (no, you cannot hack anyone using this)
- Speedhack (values over 2 not recommended)
- Shop anywhere, anytime
- Horizontal clip
- Pumpkin anywhere
- Camera utilities (lock, zoom, watch, viewclip)
- HWID bypass (for banned accounts)

### Available Commands
- `!ghost` - toggle SpeakiBot HUD
- `!lock` - lock or unlock the camera ("cinematic view")
- `!watch [player name]` - make the camera follow another player (`!watch` - follow yourself)
- `!noclip` - allow yourself to walk through walls
- `!zoom [number]` - set camera zoom, higher values = farther camera
- `!hclip (n)` - move forward `n` units (0.5 units if no argument is specified)
- `!target [entity]` - set the target mob for SpeakiBot (do `!target` to get the list of available mobs)
- `!players` - log all players, their levels & IDs to chat
- `!speed (speed)` - change your movement speed (`1` is the default value)
- `!joayo` - say joayo (also pretends like you're farming pumpkin patches, but that's fake and doesn't actually count towards anything)
- `!shop` - open the Ner shop (should work in Monatium as well, but not tested)
- `!dance` - start dancing (normally not possible in lobby, this command doesn't require you to have any item)
- (BROKEN) `!mass-inv (level threshold)` - invite all players in render distance to party (if an argument is specified, only invite players under the specified level threshold)
- (BROKEN) `!portal (level)` - teleport to a portal

## Injection Guide
1. Open Speaki RPG
2. Do Ctrl+Shift+I to open DevTools
3. Navigate to the "Sources" tab ("Debugger" tab in Mozilla Firefox)
4. At the left, navigate to the "Page" tab
5. In the file tree, follow the following path: `top` -> `speakirpg.overture.io.kr` -> `assets` -> `index-(some characters here).js`
6. Once you have the `index` file open, press Ctrl+F and type in `k.connect(g)`
7. Click once at the left of the line, a blue chevron should appear next to the line
8. Right click the blue chevron and click "Edit breakpoint..."
9. Put `!(window.gameState = k)` into the breakpoint condition - see the screenshot below to make sure everything is correct
10. Refresh the tab and enter the game (DON'T CLOSE DEVTOOLS!)
11. Wait until you are fully loaded into the game
12. Copy the source code [from here](https://raw.githubusercontent.com/Alluseri/SpeakiHax/refs/heads/main/speakihax.js) (Ctrl+A and Ctrl+C)
13. Paste it into the console (you may have to do the `allow pasting` trick first) and press Enter
14. You should see no errors in the console and "SpeakiBot OFF" at the left of the screen - that means SpeakiHax is successfully injected into the game

This is how it should look like after step 9:
<img src="https://cdn.nest.rip/uploads/768ef322-bddc-4ad4-a84e-c10ab8d82efc.png">

## My Standpoint
<img src="https://media1.tenor.com/m/YwaDkCSg1AYAAAAd/israel-human.gif">
only goyim will grind manually when botting is an option

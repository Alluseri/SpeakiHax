# SpeakiHax
A utility mod™ for the fan-made Speaki RPG

Extremely hardcoded because this is mostly for the memes. Can obviously be weaponized to mass bot servers, etc. I don't really care tho

And you can dance in the lobby!

## Features
- Grinding bot (hardcoded, you have to edit the src to make sense of it)
- HUD
- Mass invite all loaded players to party (kinda broken)
- Dump all loaded players & their player IDs (not the same as restore codes, player IDs are internal)
- Speedhack (values over 2 not recommended)
- Shop anywhere, anytime
- Horizontal clip
- Pumpkin anywhere
- HWID bypass (for banned accounts)

## Injection Guide
1. Open Speaki RPG
2. Do Ctrl+Shift+I to open DevTools
3. Navigate to the "Sources" tab
4. At the left, navigate to the "Page" tab
5. In the file tree, follow the following path: `top` -> `speakirpg.overture.io.kr` -> `assets` -> `index-(some characters here).js`
6. Once you have the `index` file open, press Ctrl+F and type in `k.connect(g)`
7. Click once at the left of the line, a blue chevron should appear next to the line
8. Right click the blue chevron and click "Edit breakpoint..."
9. Put `!(window.gameState = k)` into the breakpoint condition
10. Refresh the tab and enter the game (DON'T CLOSE DEVTOOLS!)
11. Wait until you are fully loaded into the game
12. Copy the source code [from here](https://raw.githubusercontent.com/Alluseri/SpeakiHax/refs/heads/main/speakihax.js) (Ctrl+A and Ctrl+C)
13. Paste it into the console (you may have to do the `allow pasting` trick first) and press Enter
14. You should see no errors in the console and "SpeakiBot OFF" at the left of the screen - that means SpeakiHax is successfully injected into the game

This is how it should look like after step 9:
<img src="https://cdn.nest.rip/uploads/768ef322-bddc-4ad4-a84e-c10ab8d82efc.png">

### So, how do I dance?
Type `!dance` in chat. Type it again if you want to stop dancing.

### And how do I walk into walls?
Use the `!hclip` command. It takes an optional distance argument, like `!hclip 2`.

## Maintenance
idk, maybe I'll do some minor changes but this is basically feature complete™

<img src="https://media1.tenor.com/m/YwaDkCSg1AYAAAAd/israel-human.gif">
only goyim will grind manually when botting is an option

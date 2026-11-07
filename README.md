# Pixel Virus Hunt

Build "Virus Hunt," a browser game that simulates a retro 2000s PC to teach cybersecurity awareness.

## Core concept

The player uses a fake Windows 98/XP-style desktop and makes everyday choices. Some are risky. Risky choices silently infect the PC. The player then has to notice the symptoms, investigate, find and remove every piece of malware, and only then learn what they did wrong and how to prevent it.

Game loop: Make choices → Get infected (silently) → Notice symptoms → Investigate → Remove all malware → Debrief/lesson

KEY DESIGN RULE: Never tell the player immediately that a choice was bad. No warning popups at the moment of the mistake. Consequences show up later as symptoms. The lesson comes only in the debrief.

## Visual style

- Use the NES.css framework (npm package "nes.css", import "nes.css/css/nes.min.css") for all UI components: buttons, containers, dialogs, progress bars, icons.

- Font: "Press Start 2P" (Google Fonts).

- Layout follows a Windows 98 desktop: teal or green-hills wallpaper, desktop icons on the left, a bottom taskbar with a Start button and a clock, and draggable windows with title bars and close/minimize buttons.

- In short: a Win98 layout drawn in NES.css pixel style. Keep it chunky and pixelated, with nothing glossy or modern.

## Screens

1. Title screen: "Virus Hunt — Play. Get Infected. Stay Safe." with a Start button.

2. Desktop: the main play area. Icons: My Computer, Internet Explorer, Email, Recycle Bin, Task Manager, Antivirus Scanner.

3. Scenario phase: a sequence of 5 choice events delivered as popups, emails, or desktop prompts.

4. Investigation phase: symptoms appear and the player uses the tools to hunt malware.

5. Debrief screen: lists each infection, which choice caused it, its real-world name/type, and a prevention tip.

6. Score screen: viruses found, time taken, false removals, safety rating.

## Scenarios (each has a safe and a risky option)

1. Public Wi-Fi: "CoffeeShop_FREE" (open) vs. using a phone hotspot → risky: credential stealer / man-in-the-middle

2. Unknown USB: "Found a USB labelled 'Salaries 2004' — plug it in?" → risky: worm with autorun

3. Forum download: "free_game_crack.exe" from a sketchy forum vs. the official site → risky: trojan dropper

4. Fake job interview: a recruiter email asks you to run "InterviewSetup.exe" → risky: remote access trojan

5. Password setup: choose "password123" vs. a strong passphrase → risky: account compromised later

## Symptoms (shown after infection, never explained)

- Desktop slows down (laggy window dragging)

- Random popup ads

- Unknown process in Task Manager using high CPU

- Browser homepage changed

- Strange files appearing on the desktop

- Fake "Your account was logged in from Russia" email

## Investigation tools

- Task Manager: list of processes; the player can inspect and end suspicious ones. Mix in legitimate processes (explorer.exe, svchost.exe) so the player has to think.

- File Explorer: browse folders (C:\Windows\Temp, Startup, Downloads) and delete suspicious files.

- Antivirus Scanner: finds only SOME threats (not all), so the player can't just click "scan."

- Startup Programs list: remove persistence entries.

- Removing a legitimate system file costs points.

## Win condition

All malware removed (process killed AND file deleted AND startup entry removed where applicable) → go to the debrief.

## Technical requirements

- React + TypeScript; store game state in a single reducer/context: choices made, active infections, removed items, score.

- Define scenarios and malware as data (a JSON/TS config array) so new ones can be added without changing components.

- No backend needed for this version. Use localStorage for high scores.

- Responsive enough for a laptop screen; mobile is not a priority.

## Scope for this first version

Build the full loop with all 5 scenarios, Task Manager, File Explorer, the scanner, and the debrief. Skip sound, window resizing, and multiplayer for now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4bafb1ff-2569-4aa3-b695-03292aea7d06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

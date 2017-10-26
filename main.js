"use strict";

const alert = require("./modules/alert");
const electron = require("electron");
const ipcMain = require("electron").ipcMain;
const path = require("path")
const windows = require("./modules/windows");

// -------------------------------------------------------

electron.app.on("ready", () => {
	windows.new("renderer", {width: 1200, height: 800, resizable: true, page: path.join(__dirname, "chlorine.html")});
	menu_build();
});

electron.app.on("window-all-closed", () => {
	electron.app.quit();
});

// -------------------------------------------------------

// Load a file via command line with -o filename.

ipcMain.on("renderer_ready", () => {
	let filename = "";
	for (let i = 0; i < process.argv.length - 1; i++) {
		if (process.argv[i] === "-o") {
			filename = process.argv[i + 1]
		}
	}
	if (filename !== "") {
		windows.send("renderer", "open", filename);
	}
});

// -------------------------------------------------------

function menu_build() {
	const template = [
		{
			label: "File",
			submenu: [
				{
					label: "Open...",
					accelerator: "CommandOrControl+O",
					click: () => {
						let files = electron.dialog.showOpenDialog();
						if (files && files.length > 0) {
							windows.send("renderer", "open", files[0]);
						}
					}
				},
				{
					label: "Save decompressed JSON...",
					accelerator: "CommandOrControl+S",
					click: () => {
						let outfilename = electron.dialog.showSaveDialog();
						if (outfilename) {
							windows.send("renderer", "save", outfilename);
						}
					}
				},
				{
					type: "separator"
				},
				{
					role: "quit"
				},
				{
					type: "separator"
				},
				{
					role: "toggledevtools"
				},
			]
		},
		{
			label: "Navigation",
			submenu: [
				{
					label: "Forward",
					accelerator: "Right",
					click: () => {
						windows.send("renderer", "forward", 1);
					}
				},
				{
					label: "Back",
					accelerator: "Left",
					click: () => {
						windows.send("renderer", "forward", -1);
					}
				},
				{
					type: "separator"
				},
				{
					label: "Move To Start",
					accelerator: "Home",
					click: () => {
						windows.send("renderer", "forward", -99999);
					}
				},
				{
					label: "Move To End",
					accelerator: "End",
					click: () => {
						windows.send("renderer", "forward", 99999);
					}
				},
			]
		},
		{
			label: "View",
			submenu: [
				{
					label: "Toggle Weapon Ranges",
					click: () => {
						windows.send("renderer", "toggle", "weapon_ranges");
					}
				},
				{
					label: "Toggle Docking Ranges",
					click: () => {
						windows.send("renderer", "toggle", "docking_ranges");
					}
				},
			]
		},
	];

	const menu = electron.Menu.buildFromTemplate(template);
	electron.Menu.setApplicationMenu(menu);
}

'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;
const Menu = electron.Menu;
const {Tray} = electron;
const defaultMenu = require('electron-default-menu');

var forceQuit = false;
let mainWindow = null;
let tray = null;

var deviceActionIDs = {
	'switch': 'pcoff',
	'slider': 'zoom',
	'push': 'browser',
	'lever': 'rakuten_login'
};

/* --------------------------------------------------------
 * ウィンドウを作成する
-------------------------------------------------------- */
function createMainWindow()
{
	var scr = electron.screen;
	var displaySize = scr.getPrimaryDisplay().workAreaSize;

	mainWindow = new BrowserWindow(
	{
		title: app.getName()
		,width: displaySize.width
		,height: displaySize.height
		,'minWidth': 450
		,'minHeight': 530
		,'overlay-scrollbars': false
		,"title-bar-style": "hidden-inset"
		,"node-integration": false
	});
	// mainWindow.hide();
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	mainWindow.webContents.openDevTools();
	mainWindow.on('close', function(e)
	{
		if (!forceQuit)
		{
			e.preventDefault();
			mainWindow.hide();
		}
	});
	// mainWindow.setFullScreen(true);
}

function createMenu()
{
	if (process.platform === 'darwin')
	{
		const menu = defaultMenu(app, shell);

		menu.splice(1, 0, {
			label: 'File',
			submenu: [
				{
					label: 'New File',
					accelerator: 'Command+N',
					click: () => { }
				}
			]
		});
		Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
	}
	else
	{

	}
}

function createTrayIcon()
{
	tray = new Tray(__dirname + '/imgs/menu_icon.png');
	var contextMenu = Menu.buildFromTemplate([
		{label: '表示', click: function() {showWindow();}},
		{label: '非表示', click: function() {hideWindow();}},
		{type: 'separator'},
		{label: 'スイッチ', submenu: [
			{label: 'パソコン電源', type: 'radio', checked: true, click: function() {deviceActionIDs['switch'] = 'pcoff';}}
		]},
		{label: 'スライダー', submenu: [
			{label: '拡大・縮小', type: 'radio', checked: true, click: function() {deviceActionIDs['slider'] = 'zoom';}},
			{label: 'スクロール', type: 'radio', click: function() {deviceActionIDs['slider'] = 'scroll';}}
		]},
		{label: 'プッシュボタン', submenu: [
			{label: 'ブラウザ', type: 'radio', checked: true, click: function() {deviceActionIDs['push'] = 'browser';}}
		]},
		{label: 'レバー', submenu: [
			{label: '楽天ログイン', type: 'radio', checked: true, click: function() {deviceActionIDs['lever'] = 'rakuten_login';}}
		]},		
		{type: 'separator'},
		{label: '終了', click: function() {app.quit();}}
	]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip(app.getName());
}

app.on('ready', function()
{
	createMainWindow();
	createMenu();
	createTrayIcon();
});

app.on('window-all-closed', function()
{
	if (process.platform != 'darwin')
	{
		app.quit();
	}
});

app.on('before-quit', function(e)
{
	forceQuit = true;
});

app.on('will-quit', function()
{
	mainWindow = null;
});

app.on('activate', function()
{
	showWindow();
});

/* --------------------------------------------------------
 * デスクトップのパスを返す
-------------------------------------------------------- */
exports.getDesktopPath = function()
{
	return app.getPath('desktop');
}

exports.getDeviceActionIDs = function()
{
	return deviceActionIDs;
}

exports.showWindow = function()
{
	showWindow();
}

exports.hideWindow = function()
{
	hideWindow();
}

function showWindow()
{
	mainWindow.show();
}

function hideWindow()
{
	mainWindow.hide();
}
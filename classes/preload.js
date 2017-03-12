
var ipcRenderer = require('electron').ipcRenderer;

window.onscroll = function()
{
	var range = document.documentElement.scrollHeight - 816;
	var scroll = this.scrollY;
	var ratio = scroll / range;

	ipcRenderer.sendToHost('scrolled', ratio);
}

ipcRenderer.on('scroll', (event, val) =>
{
	var range = document.documentElement.scrollHeight - 816;
	var scroll = val / 255 * range;
	window.scrollTo(0, scroll);
});

ipcRenderer.on('rakuten_login', (event, val) =>
{
	document.getElementById('userid').value = 'id';
	document.getElementById('passwd').value = 'pass';

	// ipcRenderer.sendToHost('login', 'aaa');
});
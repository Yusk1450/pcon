
declare function require(string): any;
declare var ace: any;

const remote = require('electron').remote;
const {dialog} = require('electron').remote;
const {webFrame} = require('electron');
const main = remote.require('./index');

const $ = require('./jquery-2.1.3.min.js');

const exec = require('child_process').exec;
const serialport = require('serialport');

function toInt(val:any):number
{
	return parseInt(val);
}

var webview = $('#browsearea')[0];

var sp = null;

var actions = {
	// 電源オフ
	'OF': (val) =>
	{
		// const command = 'shutdown -h now';
		// exec(command, (error, stdout, stderr) => {
		// 	console.log(error);
		// 	console.log(stderr);
		// });
		console.log('PC終了！');
	},
	// スライダー機能
	'SL': (val) =>
	{
		var actionIDs = main.getDeviceActionIDs();
		
		if (actionIDs['slider'] == 'zoom')
		{
			webFrame.setZoomFactor(3.0 * (val / 255));
		}
		else if (actionIDs['slider'] == 'scroll')
		{
			webFrame.setZoomFactor(1.0);
			webview.send("scroll", val / 255);
		}
	},
	// ボタン機能
	'BT': (val) =>
	{
		main.showWindow();
	},
	// レバー機能
	'LV': (val) =>
	{
		main.showWindow();
		redirect('https://www.rakuten.co.jp/myrakuten/login.html');
		webview.send("rakuten_login");
	}
};

/* --------------------------------------------------------
* エントリポイント
-------------------------------------------------------- */
$(function()
{
	redirect('http://49.212.141.66/yahoogle');

	$('#urlbar').focus(() =>
	{
		$(this).select();
	});
	$('#urlbar').keypress((e) =>
	{
		if (e.which == 13)
		{
			redirect($('#urlbar').val());
			return false;
		}
	});
	$('#browsearea').on('did-start-loading', () =>
	{
		$('#urlbar').attr('value', $('#browsearea').attr('src'));
	});

	setupArduinoConnect();

	webview.addEventListener('ipc-message', (event) =>
	{
		switch(event.channel)
		{
			case 'scrolled':
				console.log(event.args[0] * 255);
				// sendToArduino('SL', event.args[0] * 255);
			break;

			// case 'login':
			// 	console.log(event.args[0]);
			// break;
		}
	});
});

function redirect(url)
{
	$('#urlbar').attr('value', url);
	$('#browsearea').attr('src', url);
}

function setupArduinoConnect()
{
	var connectFunc = () => 
	{
		if (sp != null)
		{
			return;
		}

		serialport.list((err, ports) =>
		{
			ports.forEach((port) =>
			{
				if (port.manufacturer === 'Arduino (www.arduino.cc)')
				{
					sp = new serialport(port.comName,
					{
						baudrate: 9600,
						parser: serialport.parsers.readline('\n')
					});

					sp.on('data', (res) =>
					{
						var actionID = res.slice(0, 2);
						var actionVal = res.slice(2, 5);
						if (actionID in actions)
						{
							actions[actionID](toInt(actionVal));
						}
					});
				}
			});
		});
	};

	connectFunc();
	setInterval(connectFunc, 1000);
}

function sendToArduino(cmd, val)
{
	serialport.list((err, ports) =>
	{
		ports.forEach((port) =>
		{
			if (port.manufacturer === 'Arduino (www.arduino.cc)')
			{
				const sp = new serialport(port.comName,
				{
					baudrate: 9600,
				});
			}
		});
	});
}
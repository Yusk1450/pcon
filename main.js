var remote = require('electron').remote;
var dialog = require('electron').remote.dialog;
var webFrame = require('electron').webFrame;
var main = remote.require('./index');
var $ = require('./jquery-2.1.3.min.js');
var exec = require('child_process').exec;
var serialport = require('serialport');
function toInt(val) {
    return parseInt(val);
}
var webview = $('#browsearea')[0];
var sp = null;
var actions = {
    // 電源オフ
    'OF': function (val) {
        var command = 'shutdown -h now';
        exec(command, function (error, stdout, stderr) {
            console.log(error);
            console.log(stderr);
        });
        // console.log('PC終了！');
    },
    // スライダー機能
    'SL': function (val) {
        var actionIDs = main.getDeviceActionIDs();
        if (actionIDs['slider'] == 'zoom') {
            webFrame.setZoomFactor(3.0 * (val / 255));
        }
        else if (actionIDs['slider'] == 'scroll') {
            webview.send("scroll", val / 255);
        }
    },
    // ボタン機能
    'BT': function (val) {
        var actionIDs = main.getDeviceActionIDs();
        if (actionIDs['push'] == 'browser') {
            main.showWindow();
        }
        else if (actionIDs['push'] == 'rakuten_login') {
            main.showWindow();
            redirect('https://www.rakuten.co.jp/myrakuten/login.html');
            setTimeout(function () {
                webview.send("rakuten_login");
            }, 2000);
            console.log('rakuten');
        }
    },
    // レバー機能
    'LV': function (val) {
        // main.showWindow();
        // redirect('https://www.rakuten.co.jp/myrakuten/login.html');
        // webview.send("rakuten_login");
    }
};
/* --------------------------------------------------------
* エントリポイント
-------------------------------------------------------- */
$(function () {
    var _this = this;
    redirect('http://49.212.141.66/yahoogle');
    $('#urlbar').focus(function () {
        $(_this).select();
    });
    $('#urlbar').keypress(function (e) {
        if (e.which == 13) {
            redirect($('#urlbar').val());
            return false;
        }
    });
    $('#browsearea').on('did-start-loading', function () {
        $('#urlbar').attr('value', $('#browsearea').attr('src'));
    });
    setupArduinoConnect();
    webview.addEventListener('ipc-message', function (event) {
        switch (event.channel) {
            case 'scrolled':
                console.log(event.args[0] * 255);
                // sendToArduino('SL', event.args[0] * 255);
                break;
        }
    });
});
function redirect(url) {
    $('#urlbar').attr('value', url);
    $('#browsearea').attr('src', url);
}
function setupArduinoConnect() {
    var connectFunc = function () {
        if (sp != null) {
            return;
        }
        serialport.list(function (err, ports) {
            ports.forEach(function (port) {
                if (port.manufacturer === 'Arduino (www.arduino.cc)') {
                    sp = new serialport(port.comName, {
                        baudrate: 9600,
                        parser: serialport.parsers.readline('\n')
                    });
                    sp.on('data', function (res) {
                        var actionID = res.slice(0, 2);
                        var actionVal = res.slice(2, 5);
                        if (actionID in actions) {
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
function sendToArduino(cmd, val) {
    serialport.list(function (err, ports) {
        ports.forEach(function (port) {
            if (port.manufacturer === 'Arduino (www.arduino.cc)') {
                var sp_1 = new serialport(port.comName, {
                    baudrate: 9600
                });
            }
        });
    });
}

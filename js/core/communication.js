/**
 * Created by Muratd on 28/12/2015.
 * Server.js ve PC sürümlerindeki Service.js'e bağlantı, mesajlaşma ve event işlemleri/fonksiyonları...
 */

/**
 * Rabbit MQ
 */
var mq_username = "s9user",
    mq_password = "qsc!46atl.967",
    mq_vhost = "S9VisionHost",
    mq_url = 'http://{0}:15674/stomp',
    mq_queue = "/exchange/ClientHost/@{0}message";

var mq_ws;
var mq_client;

function mq_on_connect() {
    clog('MQ Connected to ' + mq_ws._base_url);
    mq_client.subscribe(mq_queue.format(setZeroToLeft(dsID, 10)), mq_on_message);
    clog('MQ Subscribed to ' + mq_queue.format(setZeroToLeft(dsID, 10)));
}

function mq_on_connect_error(e) {
    console.error('MQ Error: ' + e);
}

function mq_on_message(m) {
    console.log('MQ Message received:\n' + m.body);
    var msg = m.body.split('|');
    switch (msg[0].toLowerCase()) {
        case 'show':
            if (playStatus == 'play') setBSceneTime(msg[1]);
            break;
        case 'release':
            if (playStatus == 'play') setBSceneTime(msg[1], -1);
            break;
    }
}

function connectToRabbitMQ() {
    mq_ws = new SockJS(mq_url.format(ServerAddress));
    mq_client = Stomp.over(mq_ws);
    mq_client.heartbeat.outgoing = 0;
    mq_client.heartbeat.incoming = 0;
    mq_client.connect(
        mq_username,
        mq_password,
        mq_on_connect,
        mq_on_connect_error,
        mq_vhost
    );
}

/**
 *
 * definations, variables...
 *
 */
var tviInProgress = false;
var defaultReconnectDelay = 3000;
var reconnectDelay = defaultReconnectDelay;
var delayExtenter = 1000;
var eioSocketConnected = false;
var eioSocket = undefined;
/**
 * connectToServer
 * @param sAddr
 * @param sPort
 * @param cb
 */
function connectToServer(sAddr, sPort, cb) {
    if (eioSocketConnected) return;
    var socketString = 'ws://{0}:{1}?dsID={2}&__release={3}&model={4}&preview={5}';
    var connStr = socketString.format(
        sAddr,
        sPort,
        dsID,
        __release,
        (_platform.platform == pWebOS ? 'LGWEBOS' : 'NATIVEOS'),
        (url_params.dsid || url_params.preview ? '1' : '0')
    );

    var tryReconnnect = function () {
        ___workerTimer.setTimeout(function () {
            if (!eioSocketConnected) {
                testConnection(function (_r) {
                    if (_r.status == 'has connection') {
                        connectToServer(_r.server, _r.port);
                    } else {
                        if ((reconnectDelay += delayExtenter) > aMinute) {
                            reconnectDelay = aMinute;
                        }
                        clog('Mevcut sunucular listesindeki hiçbir sunucuya erişilemiyor. ' + (reconnectDelay / 1000) + ' Saniye sonra tekrar deneyeceğim...', lWarn);
                        tryReconnnect();
                    }
                });
            }
        }, reconnectDelay);
    };

    clog('Connecting to ' + connStr + '\n', lWarn);
    eioSocket = eio(connStr);
    //
    // on Error
    //
    eioSocket.on('error', function () {
        if (window.inUpgrading) return;
        setDisconnectedIcon();
        if (localStorage.Servers) {
            if (eioSocketConnected) {
                try {
                    eioSocketConnected = false;
                    if (typeof eioSocket !== 'undefined') {
                        eioSocket.close();
                        eioSocket = undefined;
                    }
                } catch (ee) {
                    clog('eioSocket.onError try-catch(ee):\n' + ee, lError);
                }
            }
            tryReconnnect();
        }
    });
    //
    // on Open
    //
    eioSocket.on('open', function () {
        adsSyncPlayData = [];
        newsSyncPlayData = [];
        mediaplayerSyncPlayData = [];
        sceneplayerSyncPlayData = [];
        eioSocketConnected = true;
        reconnectDelay = defaultReconnectDelay;
        ___workerTimer.clearInterval(disconnectedInterval);
        $('.disconnected').hide();
        clog('Connected to the server... ', lInfo);
        dLog(Lt.connectted);

        var ___n = performance.now();
        $.ajax({
            type: "GET",
            cache: false,
            url: 'http://' + ServerAddress + ':' + ServerPort + '/ping',
            error: function () {
                pingTimeServer = 20;
            },
            success: function () {
                pingTimeServer = performance.now() - ___n;
            }
        });


        setServerInfo(sAddr, sPort, function () {
            dLog(Lt.connectted);
            if (cb) cb(false);
            //
            // on Close
            //
            eioSocket.on('close', function () {
                eioSocketConnected = false;
                dLog(Lt.disconnected);
                setDisconnectedIcon();
                clog('Disconnected from the server... ', lInfo);
                tryReconnnect();
            });
            //
            // on Message
            //
            eioSocket.on('message', function (__data) {
                var data = {};
                try {
                    data = JSON.parse(__data);
                } catch (ee) {
                    data = {};
                }
                if (data.subject) {
                    switch (data.subject) {
                        case 'ping':
                            sendData({subject: "pong"});
                            break;
                        case 'sendConsoleLogs':
                            localStorage.sendConsoleLogs = data.onOff ? "true" : "false";
                            dLog(Lt.message, 0, 'Uzaktan console.log\'u ' + (localStorage.sendConsoleLogs == "true" ? 'açtım.' : 'kapattım.'));
                            break;
                        case 'CmdToClient':
                            try {
                                dLog(Lt.message, 0, 'Uzaktan komut gönderildi: ' + data.value);
                                clog(' ', Lt.warn);
                                clog(data.value, Lt.warn);
                                eval(data.value);
                            } catch (err) {
                                clog('console command error: ' + err);
                                dLog(Lt.error, 0, 'Uzaktan komut hatası: ' + err);
                            }
                            break;
                        case 'config':
                            setConfig(data.config);
                            break;
                        case 'dLogsOK':
                            if (localStorage._lastLogId && typeof localStorage._lastLogId !== "undefined" && Number(localStorage._lastLogId)) {
                                clog('SUNUCU LOG`ları almış, şimdi gönderdiklerimi siliyorum...');
                                dbS9.transaction(function (t) {
                                    t.executeSql("DELETE FROM LOGS WHERE ID <> ? AND ID <= ?", [_lastPing_ID, localStorage._lastLogId], function () {
                                        clog('Sunucuya gönderdiğim loglar silindi!', lInfo);
                                        localStorage.removeItem("_lastLogId");
                                    }, DB_errorHandler);
                                });
                            }
                            break;
                        case 'resetThePlayer':
                            resetThePlayer(data.options);
                            break;
                        case 'theScene':
                            if (window.analyzeTheSceneInProgrsss) return;
                            if (window.inUpgrading) return;
                            if (window.url_params.preview) return;
                            sendData({subject: "theSceneUpdated"});
                            clog('A new scene came from the server! ', lInfo);
                            dLog(Lt.message, 0, 'Yeni sahne geldi (theScene)');
                            if (!data.theScene || data.theScene == 'no') {
                                clog('data.theScene = ' + (data.theScene == 'no' ? "no" : "empty string"), lWarn);
                                dLog(Lt.message, 0, 'Gelen sahne (theScene) içeriği: ' + (data.theScene == 'no' ? '"no"' : '(empty string)'));
                                stopTheScene();
                                localStorage.removeItem('theScene');
                                $('body').append('<img class="YAYINYOK" src="img/yayinyok.png"/>');
                            } else {
                                try {
                                    window.IamSyncMaster = (data.IamSyncMaster == 1);
                                    window.MyOwnReceivers = data.receivers;
                                    console.log(window.IamSyncMaster, window.MyOwnReceivers);
                                    var newScene = typeof data.theScene == 'object' ? data.theScene : JSON.parse(data.theScene);
                                    var oldScene = lson.get('theScene');
                                    if (!oldScene || (oldScene.stage && newScene.stage && newScene.stage.guid != oldScene.stage.guid)) {
                                        window.stopTheAnaliz = true;
                                        ___workerTimer.clearInterval(window.firstPlayIntervalHandle);
                                        window.downloadBaseURI = data.downloadBaseURI;
                                        localStorage.downloadBaseURI = window.downloadBaseURI;
                                        lson.set('theScene', newScene);
                                        dLog(Lt.sceneUpdate);
                                        ___workerTimer.setTimeout(function () {
                                            window.analyzeTheSceneInProgrsss = false;
                                            window.stopTheAnaliz = false;
                                            clog('It will playing soon after...\n\n', lLog);
                                            analyzeTheScene('theScene', function (sceneOK) {
                                                if (sceneOK)
                                                    stopTheScene(function () {
                                                        playTheScene();
                                                    });
                                                //}
                                            });
                                        }, 1000);
                                    } else {
                                        clog('BUT, the scene is the same! ', lWarn);
                                        dLog(Lt.message, 0, 'Gelen sahne bendekiyle aynı!');
                                    }
                                } catch (ee) {
                                    clog('THE SCENE IS WRONG: ' + ee, lError);
                                    dLog(Lt.error, 0, 'Gelen sahne hatalı: ' + ee);
                                    clog('typeof data.theScene: ' + typeof data.theScene);
                                }
                            }
                            break;
                    }
                    if (_platform.platform == pWebOS) {
                        switch (data.subject) {
                            case 'power':
                                sendData({
                                    "subject": "doing",
                                    "msg": "I got the command: " + data.command
                                });
                                api_powerCommand(data.command);
                                break;
                            case 'tvi':
                                sendData({
                                    "subject": "doing",
                                    "msg": "I got the command: getTVI"
                                });
                                if (data.method == 'get') {
                                    var fTVI = function () {
                                        tviInProgress = true;
                                        collectTVInformationFromTV(window.TVInformation, function () {
                                            sendData({
                                                "subject": "tvi",
                                                "tvi": TVInformation
                                            });
                                            tviInProgress = false;
                                        });
                                    };
                                    if (!tviInProgress) fTVI();
                                } else if (data.method == 'set') {
                                    sendData({
                                        "subject": "doing",
                                        "msg": "I got the command: <setTVI>"
                                    });
                                    var setProps = data.value;
                                    for (var prop in setProps) {
                                        if (setProps.hasOwnProperty(prop)) {
                                            eval("window.TVInformation." + prop + ".values = setProps." + prop + ".values");
                                            tvi_api('set', prop);
                                        }
                                    }
                                    ___workerTimer.setTimeout(saveTVInformation, 500);
                                }
                                break;
                        }
                    }
                }
            });
        });
    });
}
/**
 * ------------------------------------------------------------
 * @param __data
 * @param cb
 */
function sendData(__data, cb) {
    var data = typeof __data == 'object' ? JSON.stringify(__data) : data;
    eioSocket.send(data, cb);
}
/**
 * setConfig
 * @param v
 */
function setConfig(v) {
    if (inUpgrading) return;
    clog("__release bilgisi geldi, kontrol ediyorum...");
    console.error('Mevcut / Gelen', __release, v.__release);
    if (__release != v.__release && Config.selfUpgrade.toLowerCase() == "yes") {
        inUpgrading = true;
        __release = v.__release;
        clog("     __release bilgisi farklı; şimdi `Yeni Uygulamayı` istiyorum.");
        ___workerTimer.clearInterval(firstPlayIntervalHandle);
        stopTheScene(function () {
            dLog(Lt.appUpgrade);
            api_upgradeApplication(function (err) {
                if (err) {
                    //clog("Yeni uygulama güncellenemedi!..", true);
                    dLog(Lt.error, 0, 'Yeni uygulama güncellenemedi: ' + v.__release);
                } else {
                    dLog(Lt.appUpgrade);
                    clog("The application has been upgraded. It will reboot in 3 minutes...");
                    ___workerTimer.setTimeout(api_reboot, 3000);
                }
            });
        });
    } else {
        setServerTime(v.serverTime);
        if (__release == v.__release)
            clog("     __release bilgisi aynı; güncelleme yapılmayacak!");
        else
            clog("     (Config.selfUpgrade = no) Güncelleme yapılmayacak!");
        dLog(Lt.message, 0, 'Release: ' + v.__release);
        localStorage.setItem("externalStorage", v.externalStorage);
        ContentPortrait = (_platform.platform == pWebOS && v.portrait ? 1 : 0);
        if (_platform.platform == pWebOS) {
            if (v.rules) {
                onoffRules = v.rules;
                lson.set('rules', v.rules);
            } else {
                localStorage.removeItem('rules');
            }
            pathPrefix = localStorage.externalStorage == 1 ? ppExternal : ppInternal;
            api_mkdir(pathLibrary);
            api_mkdir(pathScenes);
            api_mkdir(pathFiles);
            api_mkdir(pathData);
            api_mkdir(pathFonts);
            //api_mkdir(pathGadgets);
            api_mkdir(pathTemplates);
            apiAppMode(localStorage.externalStorage == 1 ? 'usb' : 'local');
            setTheOnOffThings();
        }
        localStorage.setItem("DownloadServer", v.forClients.downloadserverURI);
        localStorage.setItem("CriticalTemperature", v.forClients.CriticalTemperature);
        lson.set('Servers', v.forClients.Servers);
    }
}

var eioServiceSocket;
var eioServiceSocketConnected = false;
var reconnectDelay2 = defaultReconnectDelay;
/**
 *
 * @param __data
 * @param cb
 */
function sendData2Service(__data, cb) {
    var data = typeof __data == 'object' ? JSON.stringify(__data) : data;
    eioServiceSocket.send(data, cb);
}
/**
 *
 * @param cb
 */
function connectToServiceJS(cb) {
    var connStr = 'ws://' + location.host;
    var tryReconnnect = function () {
        ___workerTimer.setTimeout(function () {
            if (!eioServiceSocketConnected) {
                connectToServiceJS();
                if ((reconnectDelay2 += delayExtenter) > aMinute) {
                    reconnectDelay2 = aMinute;
                }
            }
        }, reconnectDelay2);
    };
    eioServiceSocket = eio(connStr);
    //
    // on Error
    //
    eioServiceSocket.on('error', function () {
        if (window.inUpgrading) return;
        if (window.eioServiceSocketConnected) {
            try {
                window.eioServiceSocketConnected = false;
                if (typeof window.eioServiceSocket !== 'undefined') {
                    window.eioServiceSocket.close();
                    window.eioServiceSocket = undefined;
                }
            } catch (ee) {
                clog('eioServiceSocket.onError try-catch(ee):\n' + ee, lError);
            }
        }
        tryReconnnect();
    });
    //
    // on Open
    //
    eioServiceSocket.on('open', function () {
        window.eioServiceSocketConnected = true;
        window.reconnectDelay2 = window.defaultReconnectDelay;
        clog('+[ Connected to ServiceJS ]+', lInfo);
        if (cb) cb();
        //
        // on Close
        //
        window.eioServiceSocket.on('close', function () {
            window.eioServiceSocketConnected = false;
            clog('-[ Disconnected from ServiceJS ]-', lInfo);
            tryReconnnect();
        });
        //
        // on Message
        //
        window.eioServiceSocket.on('message', function (__data) {
            var data = {};
            try {
                data = JSON.parse(__data);
            } catch (ee) {
                data = {};
            }
            if (data.subject = 'cmd') {
                data.result = undefined;
                if (data.name)
                    switch (data.type) {
                        case 'set':
                            if (data.value) {
                                cmdVariables[data.name.toLowerCase()] = data.value;
                                dLog(Lt.message, 0, 'service.js üstünden bir değişken set edildi: ' + data.name.toLowerCase() + ' = ' + data.value);
                            }
                            data.result = data.value ? 'OK' : 'error: `value` can not empty!';
                            break;
                        case 'get':
                            data.result = cmdVariables[data.name.toLowerCase()] ? cmdVariables[data.name.toLowerCase()] : 'undefined';
                            break;
                        case 'function':
                            var cb = function (err) {
                                if (!err) data.result = 'OK'; else data.result = err;
                                serviceSocket.emit("cmd", data);
                            };
                            clog('FUNCTION: ' + data.name + '(' + (data.param ? '"' + data.param + '"' : '') + '), cb()');
                            dLog(Lt.message, 0, 'FUNCTION: ' + data.name + '(' + (data.param ? '"' + data.param + '"' : '') + '), cb()');
                            eval(data.name + '(' + (data.param ? '"' + data.param + '"' : '') + '), cb()');
                            break;
                    } else {
                    data.result = 'error: `name` can not empty!';
                }
                if (data.result) sendData2Service(data);
            }
        });
    });
}
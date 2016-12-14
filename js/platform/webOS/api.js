/**
 * Created by Muratd on 02.07.2015.
 */

var onoffRules = [];
var onoffScreenIntervalHandle = 0;
var onoffScreenInterval = aSecond;
var ScreenOnOffList = [];

function apiRestart() {
    function successCb() {
    }

    function failureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog('Error in apiRestart: ' + errorCode + '(' + errorText + ')');
    }

    if (eioSocket && eioSocketConnected) {
        eioSocket.close();
    }

    var configuration = new Configuration();
    dLog(Lt.apiRestart);
    configuration.restartApplication(successCb, failureCb);
}

function setServerTime(t) {
    TVInformation.CurrentTime.values.year = t.year;
    TVInformation.CurrentTime.values.month = t.month;
    TVInformation.CurrentTime.values.day = t.day;
    TVInformation.CurrentTime.values.hour = t.hour;
    TVInformation.CurrentTime.values.minute = t.minute;
    TVInformation.CurrentTime.values.sec = t.sec;
    saveTVInformation();
    tvi_api("set", "CurrentTime");
}

function setServerInfo(s, p, cb) {
    var options = {};
    options.serverIp = s;
    options.serverPort = parseInt(p);
    options.secureConnection = false;
    options.appLaunchMode = (localStorage.appLaunchMode ? localStorage.appLaunchMode : "local");
    options.fqdnMode = false;
    options.fqdnAddr = "";
    function successCb() {
        clog("ServerInfo success...\nServer: " + s + ", Port: " + p + '\nappLaunchMode: ' + options.appLaunchMode);
        localStorage.setItem('ServerAddress', s);
        localStorage.setItem('ServerPort', p);
        ServerAddress = s;
        ServerPort = p;
        if (cb) ___workerTimer.setTimeout(function () {
            cb(false);
        }, 200);
    }

    function failureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog("Error in setServerInfo(), Code [" + errorCode + "]: " + errorText, lError);
        if (cb) cb(true);
    }

    var configuration = new Configuration();
    configuration.setServerProperty(successCb, failureCb, options);
}

function getServerInfo(cb) {
    function getServerInfosuccessCb(cbObject) {
        ServerAddress = cbObject.serverIp;
        ServerPort = cbObject.serverPort;
        localStorage.setItem('ServerAddress', ServerAddress);
        localStorage.setItem('ServerPort', ServerPort);
        localStorage.setItem('appLaunchMode', cbObject.appLaunchMode);
        if (cb) cb(true);
    }

    function getServerInfofailureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        console.log(cbObject);
        clog("Error in getServerInfo(), Code [" + errorCode + "]: " + errorText, lError);
        ServerAddress = localStorage.ServerAddress;
        ServerPort = localStorage.ServerPort;
        if (cb) cb(false);
    }

    var configuration = new Configuration();
    configuration.getServerProperty(getServerInfosuccessCb, getServerInfofailureCb);
}

function string2Bin(str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i).toString(2));
    }
    return result;
}

function writeFile(filename, data, callback) {
    var mxl = 10240;
    var _data = typeof data == 'object' ? JSON.stringify(data) : data;
    //_data = string2Bin(_data);
    var _dataLen = _data.length;
    var writtenData = 0;
    var wf = function () {
        var successCb = function (cbObject) {
            clog("'" + filename + "' Successfully writen " + cbObject.written + " bytes", lLog);
            writtenData += cbObject.written;
            if (writtenData >= _dataLen && callback) {
                callback(false, filename);
            } else {
                wf();
            }
        };
        var failureCb = function (cbObject) {
            var errorText = cbObject.errorText;
            clog(errorText, lError);
            if (callback) callback('Error in writeFile: ' + errorText, filename);
        };
        var options = {
            data: JSON.stringify(_data.slice(writtenData, mxl)),
            path: pathPrefix + filename,
            mode: 'append',
            positon: 0,
            offset: 0,
            length: mxl,
            encoding: 'utf8'
        };
        new Storage().writeFile(successCb, failureCb, options);
    };
    DeleteFile(pathPrefix + filename, function () {
        wf();
    });
}

//writeFile(pathScenes + 'a.scn', localStorage.theScene, function(err, fn){
//    clog(err + ' - ' + fn);
//    readFile(pathScenes + 'a.scn', '', function(d){
//        console.log(d)
//    });
//});


function localFileSize(fn, cb) {
    var successCb = function (cbObject) {
        if (cb) cb(cbObject.size, fn);
    };
    var failureCb = function () {
        if (cb) cb(-1, fn);
    };
    var options = {path: pathPrefix + fn};
    new Storage().statFile(successCb, failureCb, options);
}

function readFile(filename, dataType, callback) {
    var data = [];
    var readed = 0;
    var fSize = 0;
    var cb = function () {
        var __data = '';
        for (var i = 0; i < data.length; i++) __data += String.fromCharCode(data[i]);
        __data = decodeURIComponent(escape(__data));
        __data = Encoder.hasEncoded(__data) ? Encoder.htmlDecode(__data) : __data;
        if (dataType.toLowerCase() == 'json') __data = JSON.parse(__data);
        callback(__data, false);
    };
    var rf = function () {
        var successCb = function (cbObject) {
            if (cbObject.byteLength == 0) {
                cb();
            } else {
                var binary_data = cbObject.data;
                var tempUInt8Array = new Uint8Array(binary_data);
                for (var i = 0; i < tempUInt8Array.length; i++)
                    data.push(tempUInt8Array[i]);
                readed += cbObject.data.byteLength;
                rf();
            }
        };
        var failureCb = function () {
            clog(filename + "' couldn`t read from the storage!", true);
            callback('', true);
        };
        var options = {
            path: pathPrefix + filename,
            position: readed,
            //length: (fSize - readed) > 10240 ? 10240 : (fSize - readed),
            encoding: 'binary'
        };
        if (readed >= fSize) {
            cb();
        }
        else {
            new Storage().readFile(successCb, failureCb, options);
        }
    };
    localFileSize(filename, function (fs) {
        if (fs == -1) {
            clog(filename + "' couldn`t read from the storage! (fileSize: -1)", true);
            callback('', true);
        } else {
            fSize = fs;
            rf();
        }
    });
}

function fileList(directory, callback, showing) {
    var successCb = function (cbObject) {
        var files = cbObject.files;
        if (showing) {
            clog('total files: ' + files.length);
        }
        for (var i = 0; i < files.length; ++i) {
            if (showing) {
                console.log(directory + files[i].name + ' - ' + files[i].size);
            }
        }
        if (showing) {
            clog('total files: ' + files.length);
        }
        if (callback) callback(f, false);
    };
    var failureCb = function () {
        clog('error flist', true);
        if (callback) callback([], true);
    };
    var listOption = {
        path: directory
    };
    var storage = new Storage();
    storage.listFiles(successCb, failureCb, listOption);
}

function fileExists(filename, callback) {
    //clog("     Does '" + filename + "' exist in the storage?");
    var successCb = function (cbObject) {
        var exists = cbObject.exists;
        //clog("     " + (exists ? "Yes" : "No") + ", '" + filename + "' " + (exists ? "" : "doesn't ") + "exist" + (exists ? "s" : "") + " in the storage");
        callback(exists, filename);
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog("fileExists - Error Code [" + errorCode + "]: " + errorText, true);
        callback(false, filename);
    };
    var existsOption = {path: pathPrefix + filename};
    var storage = new Storage();
    storage.exists(successCb, failureCb, existsOption);
}

function GetFileFromServer(_from, _to, callback) {
    var successCb = function () {
        clog(_from + ' has been successfuly downloaded from the server.', lInfo);
        callback(false, _to, 'success'); //success
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog(_from + " couldn't download from the server! Error: (" + errorCode + ") " + errorText, lError);
        callback(true, _to, errorText); // fail
    };
    var options = {
        source: _from.indexOf("://") == -1 ? downloadBaseURI + _from : _from,
        destination: pathPrefix + _to,
        maxRedirection: 0
    };
    var storage = new Storage();
    clog('▼ ' + options.source + ' is downloading to ' + options.destination, lWarn);
    storage.copyFile(successCb, failureCb, options);
}

function api_syncFiles(cb) {
    var f = function () {
        if (cb) cb();
    };
    new Storage().fsync(f, f, {path: pathPrefix});
}

function api_upgradeApplication(callback) {
    var successCb = function () {
        dLog(Lt.appUpgrade);
        if (callback) callback(false);
    };

    var failureCb = function () {
        if (callback) callback(true);
    };

    var storage = new Storage();
    var options = {
        to: localStorage.externalStorage == 1 ? Storage.AppMode.USB : Storage.AppMode.LOCAL,
        recovery: true // all files deleted if it is false
    };
    storage.upgradeApplication(successCb, failureCb, options);
}
/**
 * api_mkdir
 * @param foldername
 */
function api_mkdir(foldername) {
    var options = {};
    options.path = pathPrefix + foldername;

    var successCb = function (cbObject) {
    };

    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog(" Error Code [" + errorCode + "]: " + errorText, lError);
    };

    var storage = new Storage();
    storage.mkdir(successCb, failureCb, options);
}
/**
 * api_rmdir
 * @param foldername
 * @param callback
 */
function api_rmdir(foldername, callback) {
    var successCb = function () {
        if (callback) callback(false);
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog("Error Code [" + errorCode + "]: " + errorText, true);
        if (callback) callback(true);
    };
    var options = {
        file: pathPrefix + foldername,
        recursive: true
    };
    var storage = new Storage();
    storage.removeFile(successCb, failureCb, options);
}
/**
 * DeleteFile
 * @param callback
 * @param filename
 */
function DeleteFile(filename, callback) {
    var successCb = function () {
        dLog(Lt.message, 0, 'Deleted file: ' + extractFilename(filename));
        if (callback) callback(false, filename);
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        //clog("Error Code [" + errorCode + "]: " + errorText, lError);
        if (callback) callback(true, filename);
    };

    var storage = new Storage();
    var options_file = {
        file: filename
    };
    storage.removeFile(successCb, failureCb, options_file);
}
/**
 * moveFile
 * @param oldPath
 * @param newPath
 * @param cb
 */
function moveFile(oldPath, newPath, cb) {
    var successCb = function () {
        console.log("Move File done.");
        if (cb) cb(false);
    };

    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        console.log(" Error Code [" + errorCode + "]: " + errorText);
        if (cb) cb(true);
    };

    var options = {
        oldPath: pathPrefix + oldPath,
        newPath: pathPrefix + newPath
    };

    var storage = new Storage();
    storage.moveFile(successCb, failureCb, options);
}
/**
 * api_removeAll
 * @param cb
 */
function api_removeAll(cb) {
    var successCb = function () {
        clog("Removed all files ", lWarn);
        dLog(Lt.removeAllFiles);
        if (cb) cb();
    };

    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog(" Error Code [" + errorCode + "]: " + errorText, lError);
        if (cb) cb();
    };

    var options_internal = {
        device: pathPrefix.indexOf('usb:1') > -1 ? 'usb:1' : 'internal'
    };

    var storage = new Storage();
    storage.removeAll(successCb, failureCb, options_internal);
}
/**
 * api_reboot
 */
function api_reboot() {
    var options = {};
    options.powerCommand = Power.PowerCommand.REBOOT;

    function successCb() {
        apiAppMode(localStorage.externalStorage == 1 ? 'usb' : 'local');
    }

    function failureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog("Error Code [" + errorCode + "]: " + errorText, lError);
    }

    eioSocket.close();
    dLog(Lt.reboot);
    dLog(Lt.appLastPing);
    new Power().executePowerCommand(successCb, failureCb, options);
}
/**
 * api_registerSystemMonitor
 * @param cb
 */
function api_registerSystemMonitor(cb) {
    var successCb = function () {
        clog("System monitoring is successfully register", lLog);
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        clog(" Error in System monitoring register, Code [" + errorCode + "]: " + errorText, lError);
    };
    var eventHandlercb = function (event) {
        cb(event);
    };
    var options = {
        monitorConfiguration: {
            fan: false, signal: false, lamp: false, screen: false, temperature: true
        },
        eventHandler: eventHandlercb
    };
    var signage = new Signage();
    signage.registerSystemMonitor(successCb, failureCb, options);
}
/**
 * api_powerCommand
 * @param c
 */
function api_powerCommand(c) {
    dLog(c == 'reboot' ? Lt.reboot : c == 'apirestart' ? Lt.apiRestart : Lt.powerOff);
    if (c == 'apirestart') {
        apiRestart();
    } else {
        var options = {};
        options.powerCommand = c;

        function successCb() {
        }

        function failureCb(cbObject) {
            var errorCode = cbObject.errorCode;
            var errorText = cbObject.errorText;
        }

        if (eioSocketConnected) eioSocket.close();

        new Power().executePowerCommand(successCb, failureCb, options);
    }
}
/**
 * changeLogoImage
 */

function changeLogoImage() {
    var successCb = function () {
        console.log("Upgrading logo image is successful");
    };

    var failureCb = function(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        console.log( " Error Code [" + errorCode + "]: " + errorText);
    };

    var options = {
        uri : 'http://' + ServerAddress + ':' + ServerPort + '/img/startupLogo.jpg'
    };

    var storage = new Storage();
    storage.changeLogoImage(successCb, failureCb, options);
}

/**
 * apiAppMode
 * @param mode
 */
function apiAppMode(mode) {
    localStorage.appLaunchMode = mode;
    setServerInfo(ServerAddress, ServerPort);
}
/**
 *
 * @param b
 */
function EnableDisableAllTimers(b) {
    new Power().enableAllOnTimer(null, null, {allOnTimer: b});
    new Power().enableAllOffTimer(null, null, {allOffTimer: b});
}
/**
 * DeleteAllTimers
 */
function DeleteAllTimers(_cb) {
    var oo = ["On", "Off"];

    function CB() {
        EnableDisableAllTimers(false);
        if (_cb) _cb();
    }

    function ooCB(obj, onOff) {
        if (obj.timerList === undefined) return false;
        var timerList = obj.timerList;
        var dle = eval("new Power().delete" + onOff + "Timer");

        function e() {
            timerList.splice(0, 1);
            if (timerList.length) deleteTimer(); else CB();
        }

        function deleteTimer() {
            dle(e, e, {
                hour: timerList[0].hour,
                minute: timerList[0].minute,
                week: timerList[0].week,
                inputSource: timerList[0].inputSource
            });
        }

        if (timerList.length) deleteTimer(); else CB();
    }

    function OnCB(obj) {
        ooCB(obj, "On");
    }

    function OffCB(obj) {
        ooCB(obj, "Off");
    }

    for (var x = 0; x < 2; x++) eval("new Power().get" + oo[x] + "TimerList(" + oo[x] + "CB, " + oo[x] + "CB)");
}
/**
 * setTheOnOffThings
 */
function setTheOnOffThings() {
    ___workerTimer.clearInterval(onoffScreenIntervalHandle);
    ScreenOnOffList = [];
    var inprocess = false;
    DeleteAllTimers(function () {
        if (inprocess) return;
        inprocess = true;
        if (typeof onoffRules == 'object' && onoffRules.length) {
            var today = new moment();
            for (var i = 0; i < onoffRules.length; i++) {
                var r = onoffRules[i];
                var beginDate = new moment(r.C_BEGINDATE);
                var endDate = new moment(r.C_ENDDATE);
                var inDays = (Math.pow(2, today.isoWeekday() - 1) & r.C_WEEKDAY) !== 0;
                if ((r.C_BEGINDATE == r.C_ENDDATE || today.isBetween(beginDate, endDate)) && inDays) {
                    if (r.RULE_TYPE == 3) {
                        //var offHour = parseInt(r.C_BEGINTIME.slice(0, 2)), offMinute = parseInt(r.C_BEGINTIME.slice(3, 5));
                        //var onHour = parseInt(r.C_ENDTIME.slice(0, 2)), onMinute = parseInt(r.C_ENDTIME.slice(3, 5));
                        //var wd = parseInt(r.C_WEEKDAY);
                        //if (offHour && offMinute && onHour && onMinute && wd) {
                        //    EnableDisableAllTimers(true);
                        //    new Power().addOnTimer(null, null, {
                        //        hour: onHour,
                        //        minute: onMinute,
                        //        week: wd,
                        //        inputSource: "ext://hdmi:1"
                        //    });
                        //    new Power().addOffTimer(null, null, {
                        //        hour: offHour,
                        //        minute: offMinute,
                        //        week: wd
                        //    });
                        //    clog('(TV POWER on/off timer) OFF TIME: ' + r.C_BEGINTIME + ', ON TIME: ' + r.C_ENDTIME);
                        //    var begin = new moment(r.C_BEGINDATE.toString().slice(0, 10 + 'T' + r.C_BEGINTIME));
                        //    var end = new moment(r.C_ENDDATE.toString().slice(0, 10 + 'T' + r.C_ENDTIME));
                        //    if (moment().isBetween(begin, end)) {
                        //        clog('TV will shut down now!');
                        //        setTimeout(function () {
                        //            api_powerCommand('powerOff');
                        //        }, 500);
                        //        ScreenOnOffList = [];
                        //        break;
                        //    }
                        //}
                    } else if (r.RULE_TYPE == 2) {
                        ScreenOnOffList.push(r);
                    }
                }
            }
            ScreenOnOffList.sort(function (a, b) {
                return moment(a.C_BEGINTIME, 'HH:mm:ss') - moment(b.C_BEGINTIME, 'HH:mm:ss')
            });
            if (ScreenOnOffList.length) {
                ___workerTimer.clearInterval(onoffScreenIntervalHandle);
                onoffScreenIntervalHandle = ___workerTimer.setInterval(function () {
                    new Power().getPowerStatus(function (o) {
                        var isScreenOpen = (o.displayMode == 'Active');
                        var today = new moment();
                        var si = function (siCMD) {
                            clog('siCMD= ' + siCMD);
                            new Power().setDisplayMode(function () {
                                dLog(siCMD == 'on' ? Lt.screenOn : Lt.screenOff);
                                clog('TV SCREEN has been ' + siCMD + ' now');
                                $('#sioff').detach();
                                if (siCMD == 'off' && playStatus == 'play') {
                                    clog('stop');
                                    stopTheScene();
                                }
                                if (siCMD == 'on' && playStatus == 'stop') {
                                    clog('play');
                                    playTheScene();
                                }
                                if (siCMD == 'off') {
                                    $('body').append('<div id="sioff" style="position:absolute;color:white;font-size:124px;left:20px;top:20px;z-index:10000">SCREEN is OFF!</div>');
                                }
                            }, null, {
                                displayMode: siCMD == 'on' ? "Active" : "Screen Off"
                            });
                        };
                        for (var i = 0; i < ScreenOnOffList.length; i++) {
                            var r = ScreenOnOffList[i];
                            var beginDate = new moment(r.C_BEGINDATE);
                            var endDate = new moment(r.C_ENDDATE);
                            var wd = parseInt(r.C_WEEKDAY);
                            var inDays = wd ? (Math.pow(2, moment().isoWeekday() - 1) & wd) !== 0 : true;
                            if ((r.C_BEGINDATE == r.C_ENDDATE || today.isBetween(beginDate, endDate)) && inDays) {
                                var a = r.C_BEGINTIME + ':00';
                                var b = r.C_ENDTIME + ':00';
                                var t = today.format('HH:mm:ss');
                                if (((t >= a && t <= b) || a == b)) {
                                    if (isScreenOpen) si('off');
                                    break;
                                }
                            }
                        }
                        if (i >= ScreenOnOffList.length) {
                            if (!isScreenOpen) si('on');
                        }
                    }, null);
                }, onoffScreenInterval);
            }
        }
    });
}
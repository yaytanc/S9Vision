/**
 * Created by Muratd on 02.07.2015.
 */

/*

 resetThePlayer({
 "willBeApplicationUpdate": "no",
 "deleteAllFiles": "no",
 "moveTo": {
 "newDSID": 1025,
 "newMasterServerAddr": "10.0.0.40",
 "newMasterServerPort": 3002
 }
 });

 */

var aSecond = 1000;
var aMinute = 60 * aSecond;
var anHour = 60 * aMinute;

var pNoSupport = -1;
var pNativeOS = 1;  // windows & Linux
var pWebOS = 2;
var pSSSP = 3;
var _platform = {
    platform: pNoSupport,
    platformName: ''
};

var lLog = 0,
    lWarn = 1,
    lInfo = 2,
    lError = 3;

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

var shuffle;
shuffle = function (v) {
    //noinspection StatementWithEmptyBodyJS
    for (var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

function isItInObjectArray(arry, key, searchValue) {
    var r = $.grep(arry, function (e, i) {
        var eva = 'e.' + key + ' == ' + (typeof searchValue ? '"' + searchValue + '"' : searchValue);
        return eval(eva);
    });
    return r.length;
}

function parseUrls(htmlCSS) {
    var h = (typeof htmlCSS == 'object' ? JSON.stringify(htmlCSS, null, 0) : htmlCSS);
    var f = h.match(/\burl\([^)]+\)/gi);
    var files = [];
    if (f && f.length) f.forEach(function (_f) {
        var aurl = _f.match(/^url\((['"]?)(.*)\1\)$/)[2];
        if (aurl && !isItInObjectArray(files, 'o', aurl)) {
            var a = aurl.split('/');
            a = a[a.length - 1];
            files.push({
                o: aurl,
                n: a
            });
        }
    });
    return files;
}
function prepareStyle(css) {
    var isJSON = (typeof css == 'object');
    var files = parseUrls(css);
    var stil = (isJSON ? JSON.stringify(css, null, 0) : css);
    if (files && files.length)
        files.forEach(function (e) {
            var p = e.o.match(/(.eot|.svg|.ttf|.woff)/) ? p = pathFonts : pathFiles;
            stil = stil.replace(new RegExp(e.o, 'g'), pathPrefix4HTML + p + e.n);
        });
    files = null;
    return isJSON ? JSON.parse(stil) : stil;
}

function checkAndDownloadMediaFiles(fn, localPath, cb) {
    var _fn = fn.split('/');
    _fn = _fn[_fn.length - 1];
    var callback = function () {
        if (cb) cb(fn, (_fn ? localPath + _fn : "")); //** cb(oldFN, newFN); **//
    };
    if (_fn && !templateMediaFiles[_fn]) {
        templateMediaFiles[_fn] = fn;
        fileExists(localPath + _fn, function (exists) {
            if (!exists) {
                var rF;
                if (!localStorage.C_HTTP_SRC && fn.indexOf(downloadBaseURI) == -1 && isHTTPs(fn))
                    rF = fn;
                else if (localStorage.C_HTTP_SRC) {
                    rF = localStorage.C_HTTP_SRC + _fn;
                } else {
                    rF = downloadBaseURI + _fn;
                }
                GetFileFromServer(rF, localPath + _fn, function (e) {
                    if (e) {
                        templateMediaFiles[_fn] = null; // çünkü indirilemedi!
                        dLog(Lt.downloadError, removeHTTP(_fn));
                        //clog('Media file couldn\'t download: ' + _fn, true);
                    } else {
                        dLog(Lt.downloadSuccess, removeHTTP(_fn));
                        //clog('Media file downloaded: ' + _fn);
                    }
                    callback();
                });
            } else {
                callback();
            }
        });
    } else
        callback();
}

function prepareTemplate(d, tags, _id, cb) {
    if (tags) {
        tags.forEach(function (t) {
            d = d.replace(eval('/' + t + '/g'), t + _id);
        });
    }
    var files = parseUrls(d);
    if (files && files.length) {
        var lasti = files.length - 1;
        files.forEach(function (e, i) {
            var p = e.o.match(/(.eot|.svg|.ttf|.woff|.otf)/) ? p = pathFonts : pathFiles;
            checkAndDownloadMediaFiles(e.n, p, function (oldFN, newFN) {
                d = d.replace(new RegExp(oldFN, 'g'), pathPrefix4HTML + newFN);
                if (i == lasti && cb) {
                    cb(d);
                }
            });
        });
    } else if (cb) {
        cb(d);
    }
}

function processPreparedTemplates(tempId, elementId, tags, cb) {
    if (preparedTemplates[__(tempId) + elementId]) {
        if (cb) cb(preparedTemplates[__(tempId) + elementId]);
    } else {
        readFile(pathTemplates + tempId + '.html', 'text', function (data, err) {
            var jData = JSON.parse(data);
            if (!err && jData && jData.rows && jData.rows.length) {
                var C_HTML = jData.rows[0].C_HTML;
                prepareTemplate(C_HTML, tags, elementId, function (d) {
                    preparedTemplates[__(tempId) + elementId] = d;
                    if (cb) cb(d);
                });
            } else {
                if (cb) cb('');
            }
        });
    }
}

function AJAX(cmd, dataType, data, cb, async) {
    try {
        $.ajax({
            type: "GET",
            cache: false,
            dataType: dataType,
            url: cmd.indexOf('http://') > -1 ? cmd : location.origin + '/' + cmd,
            data: data,
            async: async ? true : false,
            success: function (DAT) {
                if (cb)
                    cb((typeof DAT == 'object' && DAT.error) ||
                        (typeof DAT == 'string' && DAT.indexOf('é') == 0)
                        , DAT);
            },
            error: function (d, et, ee) {
                if (cb) cb(true, "error: " + et + " / " + ee);
            }
        });
    } catch (err) {
        console.error('Error in AJAX: ' + err);
        if (cb) cb(true, 'Error in AJAX: ' + err);
    }
}

function resetThePlayer(options, cb) {
    if (!options || typeof options != 'object') {
        console.log('');
        console.log('');
        console.log('');
        console.error('resetThePlayer needs a "options" parameter!');
        console.log('USAGE:\n' +
            '-----------------------------------------\n' +
            'resetThePlayer({\n' +
            '   "willBeApplicationUpdate": "no",\n' +
            '   "deleteAllFiles": "no",\n' +
            '   "moveTo": {\n' +
            '       "newDSID": -1,\n' +
            '       "newMasterServerAddr": "",\n' +
            '       "newMasterServerPort": 0,\n' +
            '   }\n' +
            '});\n\n');
    } else {
        stopTheScene(function () {
            var oldDSID = dsID;
            var localStorageKeys = 'Servers theScene DownloadServer ServerAddress ' +
                'ServerPort dsID smartTVConfig firstSetup';
            localStorageKeys.split(' ').forEach(function (c) {
                localStorage.removeItem(c);
                eval(c + ' = undefined');
            });
            templateMediaFiles = [];
            preparedTemplates = [];
            GlobalIntervals = [];
            execDBArray = [];
            console.clear();
            var f = function () {
                if (options.moveTo.newDSID > 0) {
                    oldDSID = options.moveTo.newDSID;
                }
                if (options.moveTo.newMasterServerAddr && options.moveTo.newMasterServerPort > 2000) {
                    localStorage.MasterServerAddress = options.moveTo.newMasterServerAddr;
                    localStorage.MasterServerPort = options.moveTo.newMasterServerPort;
                    setServerInfo(options.moveTo.newMasterServerAddr, options.moveTo.newMasterServerPort);
                    localStorage.setItem('smartTVConfig', 'OK');
                    localStorage.setItem('firstSetup', 'NO');
                } else {
                    setServerInfo(localStorage.MasterServerAddress, localStorage.MasterServerPort);
                }
                dsID = oldDSID;
                localStorage.dsID = oldDSID;
                ___workerTimer.setTimeout(function () {
                    checkLocalService({
                        "dsID": oldDSID,
                        "masterServerAddr": localStorage.MasterServerAddress,
                        "masterServerPort": localStorage.MasterServerPort
                    }, function () {
                        if (options.willBeApplicationUpdate == "yes") {
                            dLog(Lt.appUpgrade);
                            api_upgradeApplication(function (e) {
                                if (e) {
                                    clog('It could not be upgraded!..');
                                } else {
                                    clog("The application has been upgraded. It will reboot in 3 minutes...");
                                    ___workerTimer.setTimeout(api_reboot, 3000);
                                }
                            });
                        }
                    });
                    dLog(Lt.factorySettings);
                    clog('');
                    clog('Player turned to factory settings now.');
                    clog('I didn`t delete dLogs... see: localStorage.dLogs (convert JSON)');
                    clog('');
                    if (cb) cb();
                }, 500);
            };
            if (!options.deleteAllFiles) {
                options.deleteAllFiles = 'no';
            }
            if (options.deleteAllFiles == 'yes') {
                api_removeAll(function () {
                    ___workerTimer.setTimeout(f, 500);
                });
            } else {
                ___workerTimer.setTimeout(f, 500);
            }
        });
    }
}

function clearCMDElements() {
    $('#urlFrame').detach();
    $('#showMessage').detach();
}

function showAWebsiteInTheFrame(caption, src, cb) {
    try {
        var $d = $('<div class="showAWebsiteInTheFrame">' +
            '<div class="titleBar">&nbsp;&nbsp;' + caption + '<img onclick="$(\'body\').css(\'cursor\', \'none\');$(\'.showAWebsiteInTheFrame\').detach()" width="32" class="btnClose" style="float:right" src="img/close.png"></div>' +
            '<iframe style="width:100%;height:100%;z-index:9999;left:0;top:0" src="' + src + '" frameborder="0" scrolling="auto" id="urlFrame"></iframe></div>');
        $('.showAWebsiteInTheFrame').detach();
        $d.appendTo('body');
        $('body').css('cursor', 'pointer');
        if (cb) cb();
        $d = null;
    }
    catch (err) {
        $('.showAWebsiteInTheFrame').detach();
        if (cb) cb(err);
    }
}

function immediateShowThisScene(scene_id, cb) {
    stopTheScene();
    clearCMDElements();
    if (cb) cb();
    location.href = 'http://' + location.host + '?preview=' + scene_id;
}

function locationHREF(href, cb) {
    if (cb) cb();
    location.href = href;
}

function showMessage(data, cb) {
    stopTheScene();
    clearCMDElements();
    var p = data.split('|');
    var msg = p[0];
    var delay = p[1] ? parseInt(p[1]) : 60;
    $('<div style="padding:5px;display:table;text-align:center;background-color:#000;color:#fff;font-size:2vw;position:absolute;width:100vw;height:100vh;z-index:9999;left:0;top:0" id="showMessage"><div style="display:table-cell; vertical-align:middle;"><div>' + msg + '</div></div></div>').appendTo('body');
    if (delay != -1)
        ___workerTimer.setTimeout(function () {
            $('#showMessage').detach();
            playTheScene();
        }, delay * 1000);
    if (cb) cb();
}


function whichPlatform() {
    var r = {
        platform: pNoSupport,
        platformName: '',
        isSmartTV: false
    };

    //aşağıdaki .indexOf('web0s') içinde SIFIR karakteri var !!!
    if (navigator.userAgent.toLowerCase().indexOf('web0s') >= 0) {
        r.platform = pWebOS;
        r.platformName = 'webOS';
        r.isSmartTV = true;
    } else if (navigator.userAgent.toLowerCase().indexOf('smarthub') >= 0) {
        r.platform = pSSSP;
        r.platformName = 'SSSP';
        r.isSmartTV = true;
    } else if (navigator.userAgent.toLowerCase().indexOf('windows nt') >= 0) {
        r.platform = pNativeOS;
        r.platformName = 'nativeOS';
    } else if (navigator.userAgent.toLowerCase().indexOf('linux') >= 0) {
        r.platform = pNativeOS;
        r.platformName = 'nativeOS';
    } else {
        r.platform = pNativeOS;
        r.platformName = 'nativeOS';
    }

    return r;
}

function loadModules(modules, cb, baseURI) {
    var i = 0;
    var bu = (baseURI ? baseURI : '');

    function load() {
        var fn = bu + modules[i] + '?' + moment().format('hhmmssSSSS');
        clog(fn);
        $.getScript(fn)
            .done(function () {
                //clog(fn + " has been loaded.");
                if (++i == modules.length) {
                    if (cb) cb(false);
                }
                else
                    load();
            }).fail(function () {
                console.log('%c Error in loadModules: ' + fn + ' could not load! ', 'font-weight:bold;font-size:14px;color:white; background-color:#F00;');
                dLog(Lt.error, 0, fn + " could not load!");
                if (cb) cb(true);
            });
    }

    load();
}

var __scrLogRowCount = 0;
function clog(s, lType) {
    if (typeof lType == 'bolean' && lType) {
        lType = lError;
    } else if (lType == undefined) {
        lType = lLog;
    }
    switch (lType) {
        case lError:
            console.error(s);
            break;
        case lInfo:
            console.info(s);
            break;
        case lWarn:
            console.warn(s);
            break;
        default:
            lType = lLog;
            console.log(s);
            break;
    }
    if (typeof eioSocket !== 'undefined' && eioSocketConnected && localStorage.sendConsoleLogs == "true") {
        sendData({"subject": "consolelog", "logType": lType, "logText": s});
    }

    if (++__scrLogRowCount > 250) {
        $("#__scrLOG").empty();
        __scrLogRowCount = 0;
    }
    $("#__scrLOG").append(s + "<br>");
    var objDiv = document.getElementById("__scrLOG");
    objDiv.scrollTop = objDiv.scrollHeight;
    objDiv = null;
}

function valChk(vArr) {
    var err = true;
    for (var n in vArr) {
        var e = vArr[n];
        if (e.val() === undefined || e.val() === null || e.val() === "") {
            err = false;
            e.addClass("errorInput");
        } else
            e.removeClass("errorInput");
    }
    return err;
}

function _timestamp() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

function __(id) {
    return "__" + id;
}

function getCMDVARIABLE(varName) {
    return cmdVariables[varName.toLowerCase()] ? cmdVariables[varName.toLowerCase()] : undefined;
}

function conditationTest(conditation, defaultResult) {
    if (!conditation) conditation = defaultResult;
    conditation = conditation.toLowerCase();
    var result = false;
    if (conditation && conditation != defaultResult) {
        var ConditationSplit = conditation.split(/[\s,&=<>()|*-\+/]+/);
        ConditationSplit.forEach(function (e) {
            var v = getCMDVARIABLE(e);
            if (e.substr(0, 1).match(/[A-Za-z]/) != null && v)
                conditation = conditation.replace(new RegExp(e, 'g'), v);
        });
    } else
        result = true;
    if (!result)
        try {
            result = eval(conditation);
        } catch (err) {
            result = false;//eval(defaultResult);
        }
    //clog('conditation: ' + conditation);
    return result;
}

var chkShownRulesTick = 0;
var chkShownRulesFDate = '';
var chkShownRulesFTime = '';
function chkShownRules(m) {
    if (!m) {
        return false;
    }
    if ((performance.now() - chkShownRulesTick) > 1000) {
        chkShownRulesFDate = parseInt(moment().format('YYYYMMDD'));
        chkShownRulesFTime = parseInt(moment().format('HHmmss'));
        chkShownRulesTick = performance.now();
    }
    var date = chkShownRulesFDate;
    var time = chkShownRulesFTime;
    var beginDate = parseInt(m.beginDate ? moment(m.beginDate).format('YYYYMMDD') : date);
    var endDate = parseInt(m.endDate ? moment(m.endDate).format('YYYYMMDD') : date);
    var dateBetween = (date >= beginDate && date <= endDate);
    var beginTime = m.beginTime ? moment(m.beginTime, "HH:mm:ss").format('HHmmss') : time;
    var endTime = m.endTime ? moment(m.endTime, "HH:mm:ss").format('HHmmss') : time;
    var timeBetween = (time >= beginTime && time <= endTime || beginTime == endTime);
    var days = m.weekDay ? m.weekDay : 127;
    var toDay = Math.pow(2, moment().isoWeekday() - 1);
    var inDays = (days & toDay) !== 0;
    return dateBetween && timeBetween && inDays
}

function canIShowIt(C_BEGINDATE, C_ENDDATE) {
    if (C_BEGINDATE && C_ENDDATE && C_BEGINDATE != 'undefinedTundefined') {
        if ((performance.now() - chkShownRulesTick) > 1000) {
            chkShownRulesFDate = parseInt(moment().format('YYYYMMDD'));
            chkShownRulesFTime = parseInt(moment().format('HHmmss'));
            chkShownRulesTick = performance.now();
        }
        var
            nDate = parseInt(chkShownRulesFDate),
            nTime = parseInt('1' + chkShownRulesFTime),
            bDate = parseInt(moment(C_BEGINDATE).format('YYYYMMDD')),
            eDate = parseInt(moment(C_ENDDATE).format('YYYYMMDD')),
            bTime = parseInt('1' + moment(C_BEGINDATE).format('HHmmss')),
            eTime = parseInt('1' + moment(C_ENDDATE).format('HHmmss'));
        return (bDate <= chkShownRulesFDate) &&
            ((bDate == eDate && bTime == eTime) ||
            (bDate == eDate && bTime != eTime && nTime >= bTime && nTime <= eTime) ||
            (bDate != eDate && bTime == eTime && bTime == 1000000 && nDate >= bDate && nDate <= eDate) ||
            (bDate != eDate && ((bTime == eTime && bTime != 1000000) || bTime != eTime) && nDate >= bDate && nDate <= eDate && nTime >= bTime && nTime <= eTime));
    } else
        return true; // default
}

function calculateDuration(beginTime, endTime) {
    return moment(endTime, 'HH:mm').diff(moment(beginTime, 'HH:mm'));
}

function removeHTTP(u) {
    var a = (isHTTPs(u) == 7 ? u.toLowerCase().split('http://') : u.toLowerCase().split('https://'));
    return a[1] ? a[1] : a[0];
}

function extractFilename(fn) {
    var __fn = fn.split('/');
    __fn = __fn[__fn.length - 1];
    return __fn;
}

// Log types
var Lt = {
    message: 0,
    error: 1,
    appStart: 2,
    appLastPing: 3,
    analyzeBegin: 4,
    analyzeDone: 5,
    mediaExists: 6,
    fontExists: 7,
    downloadMediaBegin: 8,
    downloadMediaSuccess: 9,
    downloadMediaError: 10,
    downloadDataBegin: 11,
    downloadDataSuccess: 12,
    downloadDataError: 13,
    downloadFontBegin: 14,
    downloadFontSuccess: 15,
    downloadFontError: 16,
    jsPerf: 25,
    play: 26,
    stop: 27,
    appUpgrade: 28,
    sceneUpdate: 29,
    connectted: 30,
    disconnected: 31,
    removeAllFiles: 32,

    shownMedia: 40,
    shownNews: 41,
    shownAds: 42,
    shownScene: 43,

    broadcastRoundCompleted: 50,
    scenePlayerRoundCompleted: 51,
    mediaPlayerRoundCompleted: 52,

    reboot: 60,
    powerOn: 61,
    powerOff: 62,
    apiRestart: 63,
    screenOn: 64,
    screenOff: 65,

    factorySettings: 99
};

function DB_errorHandler(transaction, error) {
    clog('DB Error: ' + error.message + ' code: ' + error.code, lError);
}

var _lastPing_ID;
var _appStartID;
var _appLastPingIntervalHandle;
var sendingLogInProcess = false;

function dLog(ltype, releated_id, description) {
    if (url_params.preview || url_params.dsid || !dbS9) return;
    if (!ltype && typeof ltype != 'number') return;
    if (_lastPing_ID && ltype == Lt.appLastPing) {
        dbS9.transaction(function (t) {
            t.executeSql('UPDATE LOGS SET LDATE = ? WHERE ID = ?;',
                [moment().format('YYYY-MM-DD HH:mm:ss'), _lastPing_ID], null, DB_errorHandler);
        });
    } else {
        dbS9.transaction(function (t) {
            t.executeSql('INSERT INTO LOGS (LDATE, LTYPE, RELEATED_ID, DESC) ' +
                'VALUES(?, ?, ?, ?);', [
                moment().format('YYYY-MM-DD HH:mm:ss'),
                ltype,
                (ltype == Lt.appLastPing ? _appStartID : (parseInt(releated_id) ? releated_id : 0)),
                (description ? description : "*")
            ], function (t, r) {
                if (ltype == Lt.appLastPing) {
                    _lastPing_ID = r.insertId;
                    ___workerTimer.setInterval(function () {
                        if (!sendingLogInProcess) dLog(Lt.appLastPing);
                    }, 15000);
                } else if (ltype == Lt.appStart) {
                    _appStartID = r.insertId;
                    clog('Application has been started!', lInfo);
                    dbS9.transaction(function (t2) {
                        t2.executeSql('UPDATE LOGS SET RELEATED_ID = ? WHERE ID = ?;',
                            [_appStartID, _appStartID], function () {
                                clog('appStart log ID:' + _appStartID, lInfo);
                                dLog(Lt.appLastPing);
                                if (!_appLastPingIntervalHandle) {
                                    clog('lastPing log interval is started...');
                                    _appLastPingIntervalHandle = ___workerTimer.setInterval(function () {
                                        dLog(Lt.appLastPing);
                                        dbS9.transaction(function (t3) {
                                            t3.executeSql("SELECT * FROM LOGS", [], function (t, r) {
                                                var logsTank = [];
                                                for (var i = 0; i < r.rows.length; i++) {
                                                    logsTank.push(r.rows.item(i));
                                                }
                                                if (logsTank.length) {
                                                    localStorage.setItem('_lastLogId', logsTank[logsTank.length - 1].ID);
                                                    sendData({"subject": "dLogs", "dLogs": logsTank}, function () {
                                                        //clog("LOG`lar SUNUCUYA GÖNDERİLDİ...");
                                                        logsTank = null;
                                                    });
                                                } else {
                                                    logsTank = null;
                                                }
                                            }, DB_errorHandler);
                                        });
                                    }, 5 * aMinute);
                                }
                            }, DB_errorHandler);
                    });
                }
            }, DB_errorHandler);
        });
    }
}

function clearGadgetArea(id) {
    timingDebugDetach(id);
    $('#' + id + ' *').attr('src', '');
    $('#' + id + ' *').stop(true, false);
}

function testConnection(cb) {
    var result = {
        status: 'unknown',
        server: '',
        port: ''
    };
    var s = lson.get('Servers');
    if (s && s.length) {
        var g = s.length;

        s.forEach(function (e, i) {
            var url = 'http://' + e.server + ':' + e.port;
            $.ajax({
                url: url + '/ping',
                timeout: 2000,
                async: true
            })
                .fail(function () {
                    s[i].good = false;
                    //clog(s[i].server + ' is fail', lError);
                    g--;
                })
                .done(function () {
                    s[i].good = true;
                    //clog(s[i].server + ' is good', lInfo);
                    g--;
                });
        });
        var iv = ___workerTimer.setInterval(function () {
            if (g <= 0) {
                ___workerTimer.clearInterval(iv);
                for (var i = 0; i < s.length; i++) {
                    if (s[i].good && result.status != 'has connection') {
                        result.status = 'has connection';
                        result.server = s[i].server;
                        result.port = s[i].port;
                        break;
                    }
                }
                if (cb) cb(result);
            }
        }, 150);
    } else if (cb)
        cb(result);
}

function amIInDeviceList(dl) {
    return !dl ||
        typeof dl !== 'object' || !dl.length ||
        dl.indexOf(parseInt(dsID, 10)) > -1;

}

var closestArr = [];
function amIMasterWidget(widget, element) {
    var e = element;
    e.dataset.sp = '';
    ___workerTimer.setTimeout(function () {
        if (e.dataset.amIMasterWidget == 'yes') {
            if (!closestArr[e.id]) {
                var sp = $(e).parent().closest('div:not(#' + e.id + ') [data-type="ScenePlayer"]').attr('id');
                if (sp) closestArr[e.id] = sp;
                sp = null;
            }
            if (closestArr[e.id]) e.dataset.sp = closestArr[e.id];
        }
        widget._play(e, e.id);
        e = null;
    }, 26);
}

function doItIfIAmMasterWidget(element, funcContinue, funcDone) {
    if (element.dataset.amIMasterWidget == 'yes' && element.dataset.sp && masterWidgetFunctions[element.dataset.sp]) {
        if (typeof funcContinue !== 'function') {
            ___workerTimer.clearInterval(GlobalIntervals[element.id], element.id);
            masterWidgetFunctions[element.dataset.sp]('done');
            if (funcDone) funcDone();
        } else {
            masterWidgetFunctions[element.dataset.sp](function (b) {
                if (b) {
                    funcContinue();
                } else {
                    ___workerTimer.clearInterval(GlobalIntervals[element.id], element.id);
                    if (funcDone) funcDone();
                }
            });
        }
    } else if (typeof funcContinue == 'function') {
        funcContinue();
    }
}

function isHTTPs(s) {
    if (s && s.toLowerCase().indexOf('http://') != -1) {
        return 7
    } else if (s && s.toLowerCase().indexOf('https://') != -1) {
        return 8
    } else {
        return 0;
    }
}

function fieldSorter(fields) {
    return function (a, b) {
        return fields
            .map(function (o) {
                var dir = 1;
                if (o[0] === '-') {
                    dir = -1;
                    o = o.substring(1);
                }
                if (a[o] > b[o]) return dir;
                if (a[o] < b[o]) return -(dir);
                return 0;
            })
            .reduce(function firstNonZeroValue(p, n) {
                return p ? p : n;
            }, 0);
    };
}

function setZeroToLeft(s, totalLength) {
    return (1e15 + s + "").slice(-totalLength)
}

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

function createTimingDebug(e) {
    if (!timingDebug) return;
    $('#timingDebug_' + e.id).detach();
    var td = document.createElement('DIV');
    var offset = $(e).position();
    offset.left += 10;
    offset.top += 10;
    var cl;
    if (e.dataset.type != 'ScenePlayer') {
        offset.left += 125;
        cl = 'yellow';
    } else if (e.dataset.yayinakisi == 'no') {
        cl = 'lime';
    } else {
        offset.left += ($(e).width() - 120);
        cl = 'skyblue';
    }

    td.id = "timingDebug_" + e.id;

    $(td).css({
        "z-index": 999,
        "position": "absolute",
        "left": offset.left + "px",
        "top": offset.top + "px",
        "border": "2px solid black",
        "padding": "5px",
        "width": "100px",
        "font-size": "24px",
        "font-weight": "bold",
        "text-align": "center",
        "background-color": cl
    });
    document.body.appendChild(td);
    td = null;
}

function timingDebugDetach(id) {
    if (!timingDebug) return;
    $('#timingDebug_' + id).detach();
}

function writeTimingDebug(id, value) {
    if (!timingDebug) return;
    var td = $('#timingDebug_' + id);
    if (!td.length) {
        td = null;
        var $td = $('#' + id);
        if (!$td.length) {
            $td = null;
            return;
        }
        createTimingDebug($td.get(0));
        ___workerTimer.setTimeout(function () {
            writeTimingDebug(id, value)
        }, 50);
        $td = null;
        td = null;
    } else {
        if (value <= 0) {
            value = 0;
            //td.animateCss('tada');
        }
        td.html(value);
    }
    td = null;
}

var lson = { //json for localStorage
    set: function (key, value) {
        if (!key || !value) {
            return;
        }
        if (typeof value === "object") {
            value = JSON.stringify(value, null, 3);
        }
        localStorage.setItem(key, value);
    },
    get: function (key) {
        var value = localStorage.getItem(key);
        if (!value) {
            return;
        }
        if (value[0] === "{" || value[0] === "[") {
            return JSON.parse(value);
        }
    }
};

function getWeatherIconsServerURL(iconSetPrefix) {
    return iconSetPrefix ? downloadBaseURI : 'http://' + ServerAddress + ':' + ServerPort + '/WeatherIcons/';
}

/**
 * workerTimer
 */
var ___worker = new Worker('js/workers/timer-worker.js');
var ___workerTimer = {
    id: 0,
    callbacks: {},

    setInterval: function (cb, interval, context) {
        this.id++;
        var id = this.id;
        this.callbacks[id] = {fn: cb, context: context};
        ___worker.postMessage({command: 'interval:start', interval: interval, id: id});
        return id;
    },
    clearInterval: function (id) {
        ___worker.postMessage({command: 'interval:clear', id: id});
    },
    setTimeout: function (cb, interval, context) {
        this.id++;
        var id = this.id;
        this.callbacks[id] = {fn: cb, context: context};
        ___worker.postMessage({command: 'timeout:start', interval: interval, id: id});
        return id;
    },
    clearTimeout: function (id) {
        ___worker.postMessage({command: 'timeout:clear', id: id});
    },
    onMessage: function (e) {
        var callback;
        switch (e.data.message) {
            case 'timeout:tick':
                callback = this.callbacks[e.data.id];
                if (callback && callback.fn) callback.fn.apply(callback.context);
                this.callbacks[e.data.id] = null;
                break;
            case 'timeout:cleared':
                this.callbacks[e.data.id] = null;
                break;
            case 'interval:tick':
                callback = this.callbacks[e.data.id];
                if (callback && callback.fn) callback.fn.apply(callback.context);
                break;
            case 'interval:cleared':
                this.callbacks[e.data.id] = null;
                break;
        }
    }
};
___worker.onmessage = ___workerTimer.onMessage.bind(___workerTimer);


function processWeatherData() {
    readFile(pathData + 'weather.xml', 'text', function (data, err) {
        if (!err && data) {
            var jData = (data.indexOf('Data_') > -1) ? JSON.parse(data).rows[0].Data_ : data;
            if (jData) {
                deviceBrachLocation = (data.indexOf('BRANCH_LOCATION') > -1) ? JSON.parse(data).rows[0].BRANCH_LOCATION : undefined;
                jData = jData.indexOf('"rows"') > -1 ? jData = '' : jData;
                jData = jData.indexOf('<Weather>') > -1 ? jData : jData = '';
                if (jData) {
                    var $wxml = $(jData);
                    $wxmltest = $wxml;
                    $wxml.find('row').each(function () {
                        var $t = $(this);
                        var cityName = $t.attr('c_name');
                        if (!weatherTank[cityName]) {
                            weatherTank[cityName] = [{}, {}, {}];
                        }
                        var day = parseInt($t.attr('c_day'));
                        if (day && day >= 1 && day <= 3) {
                            day -= 1;
                            weatherTank[cityName][day].C_MIN = $t.attr('c_min');
                            weatherTank[cityName][day].C_MAX = $t.attr('c_max');
                            weatherTank[cityName][day].C_TYPE = $t.attr('c_type');
                        }
                    });
                    $wxml = null;
                }
            }
        }
    });
}
/**
 * Created by Muratd on 16/12/2015.
 */

function ExecDB() {
    var args = Array.prototype.slice.call(arguments);
    var result = {
        'error': '',
        'rows': []
    };
    if (args.length < 1) {
        result.error = 'Parameter error. e.g.: ExecDB("dbFuncName", param1, param2, param3, ..., callbackFunc);';
        clog(result.error, true);
        return;
    }
    var fn = args[0];
    var dbFuncName = args[1];
    var callback = typeof args[args.length - 1] == 'function' ? args[args.length - 1] : undefined;
    var lastArgNo = callback ? args.length - 1 : args.length;
    var params = lastArgNo > 2 ? args.slice(2, lastArgNo).toString() : '';
    var execString = dbFuncName + ' ' + params;
    if (fn == '') {
        fn = (execString.toLowerCase().indexOf('template') > -1 ? pathTemplates : pathFiles);
        if (fn.indexOf(pathTemplates) > -1) fn += params + '.html'; else fn += params + '.json';
    }
    fn = fn.replace(eval('/,/g'), '_');
    var needPreviewParam = execString.toLowerCase().match(/device_html_template|device_json|template_json/g);
    var uri = 'http://' + ServerAddress + ':' + ServerPort + '/dbExec?execString=' + execString;
    uri += (needPreviewParam !== null ? (url_params.preview ? ', 0' : ', 1') : '');
    var r = {error: '', data: '', filename: fn};
    var readFunc = function () {
        readFile(fn, 'text', function (d) {
            var jData;
            try {
                jData = JSON.parse(d);
                if (dbFuncName == 'Device_XML_Data') {
                    if (jData.rows && jData.rows.length && jData.rows[0].Data_) {
                        r.data = jData.rows[0].Data_;
                    } else {
                        r.data = '';
                        r.error = 'no row';
                    }
                } else {
                    r.data = jData;
                }
                if (callback) callback(r, r.error);
            } catch (ee) {
                r.data = '';
                r.error = 'Error in ExecDB.readFile (' + uri + '): ' + ee;
                clog(r.error, lError);
                if (callback) callback(r, r.error);
            }
        });
    };

    testConnection(function (r) {
        if (r.status == 'has connection') {
            var a = (dbFuncName.toLowerCase().match(/device_html_template|template_json/g) ? args[2] : args[3]);
            dLog(Lt.downloadDataBegin, a, dbFuncName);
            GetFileFromServer(uri, fn, function (err) {
                if (err) {
                    dLog(Lt.downloadDataError, a, dbFuncName);
                    clog('Error in ExecDB: ' + uri, lError);
                    r.error = 'Error in ExecDB: ' + err;
                    if (callback) callback(r, r.error);
                } else {
                    dLog(Lt.downloadDataSuccess, a, dbFuncName);
                    ___workerTimer.setTimeout(function () {
                        readFunc();
                    }, 750);
                }
            });
        } else {
            clog('Server`a bağlı değilim, varsa yerel disktekini okuyacağım: ' + fn, lWarn);
            dLog(Lt.message, 0, 'Server`a bağlı değilim, diskten okuyacağım: ' + fn);
            readFunc();
        }
    });
}

/***
 *
 * @param sceneID
 * @param callback
 */
function GetSceneFromServer(sceneID, callback) {
    var res = {error: '', scene: {}};
    if (sceneID == 'theScene') {
        res.scene = lson.get('theScene');
        ___workerTimer.setTimeout(function () {
            if (callback) callback(res, false);
        }, 250);
    } else {
        var fn = pathScenes + sceneID + '.scn';
        ExecDB(fn, 'Template_Json', sceneID, function (r, e) {
            if (e || stopTheAnaliz) {
                if (!stopTheAnaliz) clog('Scene couldn`t download from server: ' + sceneID + '(error:' + e + ')', lError);
                if (callback && !stopTheAnaliz) callback(res, e);
            } else {
                if (r.data && r.data.rows && r.data.rows.length && r.data.rows[0].C_JSON != 'no') {
                    res.scene = JSON.parse(r.data.rows[0].C_JSON);
                    if (callback) callback(res, false);
                } else {
                    res.scene = '';
                    res.error = 'no json';
                    if (callback) callback(res, res.error = 'no json');
                }
            }
        });
    }
}

//function get_filesize(url, cb) {
//    AJAX('http://' + ServerAddress + ':' + ServerPort + '/get_filesize', '', {"url": url}, function (e, d) {
//        if (cb) cb(parseInt(d) || -1);
//    });
//}

/***
 *
 * @param remoteFileName   remote file
 * @param fn    local filename
 * @param cb    callback cb(filesize, errorText/resultText, localFileName)
 *                          "filesize = -1" is ERROR, otherwise it is filesize of url
 *
 */
function downloadFile(remoteFileName, fn, cb) {
    var rf = decodeURIComponent(remoteFileName);
    $.ajax({
        type: "GET",
        timeout: 2000,
        cache: false,
        url: 'http://' + ServerAddress + ':' + ServerPort + '/get_filesize',
        data: {
            "url": rf
        },
        error: function (xhr, desc, er) {
            if (cb)
                cb(-1, er, fn);
            else
                console.log('Error: ' + er);
        },
        success: function (d) {
            var remoteFileSize = parseInt(d);
            if (fn) {
                DeleteFile(pathPrefix + fn, function () {
                    localStorage.setItem("lastDownloadingFile", pathPrefix + fn);
                    GetFileFromServer(rf, fn);
                    ___workerTimer.setTimeout(function () {
                        if (playStatus == 'stop') {
                            $('#downloadingBar').show();
                        }
                        var lastSize = 0;
                        var FileSizeTryCount = 0;
                        var waitDL = ___workerTimer.setInterval(function () {
                            localFileSize(fn, function (fz, lfn) {
                                if (lastSize != fz && !stopTheAnaliz) {
                                    lastSize = fz;
                                    FileSizeTryCount = 0;
                                    if (playStatus == 'stop') {
                                        $('#downloadingBar').html('<span class="db1">' + lastSize + ' / ' + remoteFileSize + '</span>&nbsp;&nbsp;&nbsp;' + ((lastSize / remoteFileSize) * 100).toFixed(1) + '%<br><span class="db2">' + extractFilename(fn) + '</span>');
                                    }
                                    if (lastSize >= remoteFileSize) {
                                        ___workerTimer.clearInterval(waitDL);
                                        $('#downloadingBar').hide();
                                        localStorage.removeItem("lastDownloadingFile");
                                        if (cb)
                                            cb(remoteFileSize, 'success', lfn);
                                        else
                                            clog(lfn + ' done.');
                                    }
                                } else if (++FileSizeTryCount > 30 || stopTheAnaliz) {
                                    ___workerTimer.clearInterval(waitDL);
                                    DeleteFile(pathPrefix + fn);
                                    localStorage.removeItem("lastDownloadingFile");
                                    $('#downloadingBar').hide();
                                    if (cb && !stopTheAnaliz) cb(-1, 'error', lfn);
                                }
                            });
                        }, 250);
                    }, 500);
                });
            } else {
                clog('Remote file size: ' + remoteFileSize + ', Remote file: ' + rf);
            }
        }
    });
}






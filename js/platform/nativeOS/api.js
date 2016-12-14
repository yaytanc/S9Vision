/**
 * Created by Muratd on 02.07.2015.
 *
 * Windows ve Linux için JS kodları
 * service.js (nodeJS) vasıtasıyla...
 */

function apiRestart(cb) {
    var h = location.href;
    h = h.split('?');
    h = h[0] + '?' + _timestamp();
    location.href = h;
    dLog(Lt.apiRestart);
    if (cb) cb();
}

function api_reboot(cb) {
    apiRestart(cb);
}

function setServerTime(t, cb) {
    AJAX('setTime', 'text', {serverDateTime: t}, function (err, data) {
        if (err) clog('setTime - ' + data, lError);
        if (cb) cb(data, err);
    });
}

function api_upgradeApplication(cb) {
    AJAX('upgradeMe', 'text', {ServerAddress: ServerAddress, ServerPort: ServerPort}, function (err) {
        if (cb) cb(err);
    });
}

function setServerInfo(s, p, cb) {
    clog('Server        : ' + s + ':' + p);
    clog("ServerInfo success...\nServer: " + s + ", Port: " + p, lInfo);
    localStorage.setItem('ServerAddress', s);
    localStorage.setItem('ServerPort', p);
    ServerAddress = s;
    ServerPort = p;
    if (cb) ___workerTimer.setTimeout(function () {
        cb(false);
    }, 200);
}


function api_removeAll(cb) {
    AJAX('removeAllTheFiles', 'text', {}, function () {
        dLog(Lt.removeAllFiles);
        if (cb) cb();
    });
}

function getServerInfo(cb) {
    ServerAddress = localStorage.ServerAddress;
    ServerPort = localStorage.ServerPort;
    if (cb) cb(true);
}

function fileExists(filename, callback) {
    //clog("     Does '" + filename + "' exist in the storage?");
    AJAX('fileExists', 'json', {filename: pathPrefix + filename}, function (err, data) {
        var exists = !err && data.result == 'yes';
        if (err) clog('fileExists - ' + data, lError);
        if (callback) callback(exists, filename);
    }, true);
}

function localFileSize(fn, cb) {
    AJAX('fileSize', 'text', {filename: pathPrefix + fn}, function (err, fSize) {
        if (err) {
            clog('Error in fileSize: ' + err, lError);
            if (cb) cb(-1, fn);
        } else {
            if (cb) {
                cb(parseInt(fSize), fn);
            } else {
                clog(fn + ' : ' + fSize);
            }
        }
    }, true);
}

function readFile(filename, dataType, callback) {
    AJAX('readFile', dataType, {filename: pathPrefix + filename}, function (err, data) {
        if (err) clog('(Error in readFile) - fn: ' + filename + ' - err: ' + data, lError);
        if (callback) callback(data, err, filename);
    }, false);
}

function writeFile(filename, data, callback) {
    AJAX('writeFile', '', {filename: filename, data: data}, function (err, data) {
        if (err) clog('writeFile - ' + data, lError);
        if (callback) callback(err, filename);
    });
}

function DeleteFile(filename, callback) {
    AJAX('deleteFile', '', {filename: filename}, function (err) {
        dLog(Lt.message, 0, 'Deleted file: ' + filename);
        if (callback) callback(err, filename);
    });
}

function fileList(directory, callback) {
    AJAX('fileList', 'json', {directory: pathPrefix + directory}, function (err, data) {
        if (err) clog('fileList - ' + data, lError);
        if (callback) callback(data, err, directory);
    });
}

function GetFileFromServer(_from, _to, callback) {
    clog('▼ ' + _from + ' is downloading to ' + _to, lWarn);
    AJAX('GetFileFromServer', 'text', {_from: _from, _to: pathPrefix + _to}, function (err, data) {
        if (err || data == 'error') {
            clog('■ ' + _from + " couldn't download from the server! Error: (" + err + ")", lError);
            if (callback) callback(true, _to, data);
        } else {
            clog('☻ ' + _from + ' has been successfuly downloaded from the server.', lInfo);
            if (callback) callback(false, _to, 'success');
        }
    }, true);
}

function api_syncFiles(cb) {
    if (cb) cb();
}
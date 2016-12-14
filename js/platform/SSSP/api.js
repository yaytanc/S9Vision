/**
 * Created by Emink on 05.09.2016.
 */

//var onoffRules = [];
//var onoffScreenIntervalHandle = 0;
//var onoffScreenInterval = aSecond;
//var ScreenOnOffList = [];

var sefPlugin;
var MainSmartHub = {};

function executeSefPlugin(sefModule, moduleFunction, p1, p2) {
    sefPlugin = null;
    sefPlugin = document.getElementById('sefPlugin');
    clog(typeof sefPlugin + '<>' +  sefModule + ' <> ' + moduleFunction);
    sefPlugin.Open(sefModule, "1.000", sefModule);
    var r = sefPlugin.Execute(moduleFunction, p1, p2);
    sefPlugin.Close();
    return r;
}

function getServerInfo(cb) {
    var a = removeHTTP(executeSefPlugin("LFDControl", "GetURLLauncherAddress"));
    if (a && typeof a == 'string') {
        var arrStr = a.split(":");
        ServerAddress = arrStr[0];
        ServerPort = arrStr[1] ? arrStr[1].split("/")[0] : '3002';
    }
    localStorage.setItem('ServerAddress', ServerAddress);
    localStorage.setItem('ServerPort', ServerPort);
    if (cb) cb(true);
}

function setServerInfo(s, p, cb) {
    localStorage.setItem('ServerAddress', s);
    localStorage.setItem('ServerPort', p);
    ServerAddress = s;
    ServerPort = p;
    if (cb) cb();
}

function api_syncFiles(cb) {
    if (cb) cb();
}

function api_mkdir(foldername) {
    MainSmartHub.localFileSystem = new FileSystem();
    if (MainSmartHub.localFileSystem.isValidCommonPath(foldername) != 1) {
        clog("Klasör Yok " + pathPrefix + foldername);
        var created = MainSmartHub.localFileSystem.createCommonDir(foldername);
        clog((created ? 'Successfully created folder: ' : 'Failed to make folder: ') + pathPrefix + foldername);
    } else {
        clog("Klasör Mevcut " + foldername);
    }
}

function localFileSize(fn, cb) {
    sefPlugin = document.getElementById('sefPlugin');
    sefPlugin.Open('FileSystem', '1.000', 'FileSystem');
    var fsResult = sefPlugin.Execute("GetFileSize", pathPrefix + fn);
    sefPlugin.Close();
    clog("localFileSize : " + fsResult);
}

function readFile(filename, dataType, callback) {

    $("#data").append(filename);

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
            //new Storage().readFile(successCb, failureCb, options);

            //sefPlugin.Open('FileSystem', '1.000', 'FileSystem');
            //var fileObj = localFileSystem.openCommonFile(fileCommonPath, 'w+');
            //sefPlugin.close();
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


function fileExists(filename, callback) {
    sefPlugin = document.getElementById('sefPlugin');
    sefPlugin.Open('FileSystem', '1.000', 'FileSystem');
    var existResult = sefPlugin.Execute('IsExistedPath', pathPrefix + filename);
    sefPlugin.Close();
    clog("existResult : " + existResult)
    //true=1
    //false=0
    callback(existResult, filename);
}


function GetFileFromServer(_from, _to, callback) {

    var sefPlugin = document.getElementById('sefPlugin');
    sefPlugin.Open('Download', '1.000', 'Download');
    sefPlugin.OnEvent = function (eventType, status) {
        onDownloadStatusEvent(status, _to, callback);
    };

    var dresult = sefPlugin.Execute('StartDownFile', _from, pathPrefix + _to, 0, 10);
    clog("Start Download Result= " + dresult);
}

function fileList(directory, callback, showing) {
    var sefPlugin = document.getElementById('sefPlugin');
    sefPlugin.Open('FileSystem', '1.000', 'FileSystem')
    sefPlugin.Execute('SetWidgetInfo', 2, "/mtd_down/");
    ;
    clog("GetListFiles : " + sefPlugin.Execute('GetListFiles', pathPrefix + directory));
    sefPlugin.Close();
    if (callback) callback(f, false);
}

function api_syncFiles(cb) {
    if (cb) cb();
}


function onDownloadStatusEvent(message, _to, callback) {
    var messageArray = message.split('?');
    if (messageArray[0] === '1000') {
        if (messageArray[1] === '1') {
            clog('Download Success');
            callback(false, _to, 'success');

        } else {
            clog('Download Failed. Response Code=' + messageArray[1]);
            callback(true, _to, messageArray[1]);
        }
    }
    else if (messageArray[0] === '1001') {
        clog('Download progress: ' + messageArray[1] + '%');
    }
}

/*  usb directory list
 var fileSystemObj = new FileSystem();
 var usbPath = '$USB_DIR/sdb1';
 var arrFiles = fileSystemObj.readDir(usbPath)
 if (arrFiles) {
 for (var i=0; i < arrFiles.length; i++) {
 clog(arrFiles[i].name);
 clog(arrFiles[i].isDir);
 }
 }*/



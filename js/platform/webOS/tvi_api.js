/**
 * Created by Muratd on 10.11.2015.
 */

function tvi_api(_sg, prop, cb) {
    if (_platform.platform != pWebOS) return;
    if (once1Info.indexOf(prop) > -1) {
        if (once1Info[prop] == 1) return;
        once1Info[prop] = 1;
    }
    var tvi = eval("TVInformation." + prop);
    if (tvi.api == "special") return;
    if (eval("tvi.methods." + _sg) === undefined) return false; // teorik olarak biz bile bile bu yanlışı yapmayız...
    ++tvi_count;
    var SetGetMethod = eval("tvi.methods." + _sg);
    var options = {};

    function tvi_failureCb(cbObject) {
        --tvi_count;
        tvi.LastSet = "fail " + _timestamp();
        clog("Error in " + _sg + prop + ": " + cbObject.errorCode);
        if (cb) cb();
    }

    function tvi_successCb(cbObject) {
        --tvi_count;
        if (_sg == "get") {
            tvi.LastGet = _timestamp();
            tvi.values = cbObject;
            for (var p in tvi.values) {
                eval("tvi.values." + p + " = cbObject." + p);
            }
        } else {
            tvi.LastSet = "success " + _timestamp();
            clog(prop + " `set` edildi");
        }
        if (cb) cb();
    }

    if (_sg == "set") {
        for (var p in tvi.values) {
            eval("options." + p + " = tvi.values." + p);
        }
    }
    if (_sg == "get" && prop == "SystemUsageInfo") {
        options = {cpus: true, memory: true};
    }
    if (_sg == "get" && prop == "captureScreen") {
        dLog(Lt.message, 0, 'Ekran görüntüsü alındı');
        options = {save: false, thumbnail: false};
    }
    if (_sg == "get" && prop == "listFiles") {
        options = {path: pathPrefix + pathFiles};
    }
    eval("new " + tvi.api + "()." + SetGetMethod + prop + "(tvi_successCb, tvi_failureCb" + (!jQuery.isEmptyObject(options) ? ", options" : "") + ")");
}

function systemMonitoringCallback(event) {
    if ("THERMOMETER" == event.source) {
        if (TVInformation.other.temperature === undefined)
            TVInformation.other.temperature = {
                "value": 0,
                "lastUpdate": ""
            };
        TVInformation.other.temperature.lastUpdate = _timestamp();
        TVInformation.other.temperature.value = event.data.temperature;

        //clog("------");
        //clog("temperature: " + TVInformation.other.temperature.value);
        //clog("CriticalTemperature: " + localStorage.CriticalTemperature);
        //clog("------");

        if (TVInformation.other.temperature.value >= localStorage.CriticalTemperature &&
            TVInformation.other.temperature.value <= localStorage.CriticalTemperature + 5 &&
            TVInformation.PictureProperty.values.backlight > 0) {
            TVInformation.PictureProperty.values.backlight = 0;
            tvi_api("set", "PictureProperty");
            sendData({"subject": "temp_alert", "value": TVInformation.other.temperature.value});
        } else if (TVInformation.other.temperature.value > localStorage.CriticalTemperature + 5) {
            sendData({"subject": "temp_alert", "value": -1});
            $('body').append('<div style="text-align:center;width:50%;font-size:32px;border:2px dashed cyan;" class="configError">TV aşırı ısındı! Bir dakika sonra otomatik olarak kapanacaktır...</div>');
            ___workerTimer.setTimeout(function () {
                api_powerCommand("powerOff");
            }, aMinute);
        } else if (TVInformation.other.temperature.value <= localStorage.CriticalTemperature - 5 && TVInformation.PictureProperty.values.backlight == 0) {
            sendData({"subject": "temp_alert", "value": TVInformation.other.temperature.value});
            TVInformation.PictureProperty.values.backlight = 100;
            tvi_api("set", "PictureProperty");
        }
        lson.set('TVInformation', TVInformation);
    }
}

function collectTVInformationFromTV(node, cb) {
    tvi_count = 0;
    var prop;
    var tim = 0;
    for (prop in node) {
        if (node.hasOwnProperty(prop)) {
            tvi_api("get", prop);
            clog('        ' + prop);
        }
    }
    var c = ___workerTimer.setInterval(function () {
        tim += 1;
        if (tvi_count <= 0 || tim > 20) {
            ___workerTimer.clearInterval(c);
            saveTVInformation();
            console.log('collectTVInformationFromTV bilgileri topladı ve kaydetti');
            if (cb) cb();
        }
    }, 200);
}

function saveTVInformation() {
    lson.set("TVInformation", TVInformation);
}

function loadTVInformation(cb) {
    if (localStorage.TVInformation === undefined) {
        collectTVInformationFromTV(TVInformation, function () {
            if (cb) cb();
        });
    } else {
        TVInformation = lson.get("TVInformation");
        TVInformation.DisplayMode.values.displayMode = "Active";
        // TV'nin açılışta ilk olarak set edilmesi gereken ayarlarını işliyoruz.
        tvi_api("set", "PictureProperty");
        tvi_api("set", "DisplayMode");
        if (TVInformation.Muted.values.muted) {
            tvi_api("set", "Muted");
        } else {
            tvi_api("set", "VolumeLevel");
        }
        if (cb) cb();
    }
}

function api_tileMode(onoff, row, col, tileId) {
    var options = {
        tileInfo: {
            enabled: onoff,
            row: (row ? row : 2),
            column: (col ? col : 2),
            tileId: (tileId ? tileId : 1),
            naturalMode: true
        }
    };

    var successCb = function () {
        console.log("Tile Info successfully Set");
    };

    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        console.log(" Error Code [" + errorCode + "]: " + errorText);
    };

    var signage = new Signage();
    signage.setTileInfo(successCb, failureCb, options);
}
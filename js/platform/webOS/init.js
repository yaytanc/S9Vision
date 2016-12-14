/**
 * Created by Muratd on 02.07.2015.
 */
var ppInternal = "file://internal/";
var ppExternal = "file://usb:1/";
var pathPrefix = localStorage.externalStorage == 1 ? ppExternal : ppInternal;
var pathPrefix4HTML = "./content/";
var js__modules = [
    "js/platform/webOS/cordova/2.7.0/cordova.webos.js",
    "js/platform/webOS/cordova-cd/1.3/configuration.js",
    "js/platform/webOS/cordova-cd/1.3/deviceInfo.js",
    "js/platform/webOS/cordova-cd/1.3/inputSource.js",
    "js/platform/webOS/cordova-cd/1.3/power.js",
    "js/platform/webOS/cordova-cd/1.3/signage.js",
    "js/platform/webOS/cordova-cd/1.3/sound.js",
    "js/platform/webOS/cordova-cd/1.3/storage.js",
    "js/platform/webOS/cordova-cd/1.3/video.js",
    "js/platform/webOS/api.js",
    "js/platform/webOS/tvi_type.js",
    "js/platform/webOS/tvi_api.js"
];
function __init(cb) {
    if (__initOK == 'YES') {
        if (cb) cb(false);
    } else {
        loadModules(js__modules, function (err) {
            var configuration = new Configuration();
            var options = {};
            options.enabled = true;
            configuration.debug(
                function () {
                    localStorage.webInspector = 'ok';
                    console.log("SUCCESS: WEBOS Web Inspector is enabled now");
                },
                function () {
                    console.error("FAIL: WEBOS Web Inspector isn`t enabled!");
                    localStorage.removeItem("webInspector");
                },
                options);
            var power = new Power();
            power.enableWakeOnLan(null, null, {wakeOnLan: true});
            api_tileMode(false);
            changeLogoImage();
            loadTVInformation(function () {
                api_registerSystemMonitor(systemMonitoringCallback);
                __initOK = 'YES';
                if (cb) cb(err);
            });
        });
    }
}
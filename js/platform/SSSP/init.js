/**
 * Created by Muratd on 02.07.2015.
 */
var ppInternal = "/mtd_down/";
var ppExternal = "$USB_DIR/";
var pathPrefix = localStorage.externalStorage == 1 ? ppExternal : ppInternal;
var pathPrefix4HTML = "./content/";

var js__modules = [
    "js/platform/SSSP/api.js",
    "js/platform/SSSP/keyboard.js"
];

function __init(cb) {


    if (__initOK == 'YES') {
        if (cb) cb(false);
    } else {
        loadModules(js__modules, function (err) {
            /**
             * 1.) webInspector a��lacak. Enabled yap�lacak
             * 2.) Network wakeOnLan enable yap�lacak
             * 3.) Logo de�i�tirlmesi yap�lacak, �ayer m�mk�nse
             * 4.) LG'deki gibi TVInformation set/get yap�lacak
             */
            __initOK = 'YES';
            if (cb) cb(err);
        });
    }
}
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
             * 1.) webInspector açýlacak. Enabled yapýlacak
             * 2.) Network wakeOnLan enable yapýlacak
             * 3.) Logo deðiþtirlmesi yapýlacak, þayer mümkünse
             * 4.) LG'deki gibi TVInformation set/get yapýlacak
             */
            __initOK = 'YES';
            if (cb) cb(err);
        });
    }
}
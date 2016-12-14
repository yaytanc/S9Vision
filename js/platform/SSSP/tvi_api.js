/**
 * Created by Muratd on 08/09/2016.
 */
function tvi_api(setget, prop, cb) {
    var _sefP = document.getElementById('sefPlugin');
    switch (prop) {
        case 'NetworkInfo':
            TVInformation.NetworkInfo.values.wired.ipAddress = null;
            TVInformation.NetworkInfo.values.wifi.ipAddress = null;
            var ip = _sefP.Execute('getIP', 1);
            if (!ip) {
                ip = _sefP.Execute('getIP', 0);
                if (ip) {
                    TVInformation.NetworkInfo.values.wifi.ipAddress = ip;
                }
            } else {
                TVInformation.NetworkInfo.values.wired.ipAddress = ip;
            }
            break;
    }
    _sefP.Close();
    if (cb) cb();
}

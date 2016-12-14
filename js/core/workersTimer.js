/**
 * Created by Muratd on 12/10/2016.
 */

/**
 * workerTimer
 */
var ___worker = new Worker('js/workers/timer-worker.js');
var ___workerTimer = {
    callbacks: {},
    id: 0,
    getID: function () {
        return this.id++;
    },
    commonMSGClear: function (id) {
        if (this.callbacks[id]) {
            wlog('___workerTimer.CLEAR, id=' + id);
            this.callbacks[id].fn = null;
            this.callbacks[id].elementID = null;
            this.callbacks[id] = null;
        }
        delete this.callbacks[id];
    },
    commonMSGTick: function (id) {
        var callback = this.callbacks[id];
        if (callback && (!callback.elementID || elementExistsInBody(callback.elementID))) {
            if (callback && callback.fn) callback.fn();
        } else {
            if (callback && callback.elementID) wlog('Bu interval`a ait Element(' + callback.elementID + ') BODY içinde yok! Interval`ı CLEAR yaptım!');
            this.clearInterval(id);
        }
        callback = null;
    },
    commonSET: function (tType, cb, interval, checkElementID) {
        var id = this.getID();
        this.callbacks[id] = {fn: cb, elementID: checkElementID, tType: tType};
        wlog('___workerTimer.SET' + tType + ', id=' + id);
        ___worker.postMessage({command: tType, interval: interval, id: id});
        return id;
    },
    commonCLEAR: function (tType, id) {
        ___worker.postMessage({command: tType, id: id});
    },
    setInterval: function (cb, interval, checkElementID) {
        return this.commonSET('interval:start', cb, interval, checkElementID);
    },
    clearInterval: function (id) {
        this.commonCLEAR('interval:clear', id);
    },
    setTimeout: function (cb, interval) {
        return this.commonSET('timeout:start', cb, interval);
    },
    clearTimeout: function (id) {
        this.commonCLEAR('timeout:clear', id);
    },
    onMessage: function (e) {
        switch (e.data.message) {
            case 'timeout:tick':
                this.commonMSGTick(e.data.id);
                this.commonMSGClear(e.data.id);
                break;
            case 'timeout:cleared':
                this.commonMSGClear(e.data.id);
                break;
            case 'interval:tick':
                this.commonMSGTick(e.data.id);
                break;
            case 'interval:cleared':
                this.commonMSGClear(e.data.id);
                break;
        }
    }
};
___worker.onmessage = ___workerTimer.onMessage.bind(___workerTimer);
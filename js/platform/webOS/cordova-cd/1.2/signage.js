cordova.define("cordova/plugin/signage", function (i, w, c) {
    var x;

    function g(y) {
    }

    if (window.PalmSystem) {
        g("Window.PalmSystem Available");
        x = i("cordova/plugin/webos/service")
    } else {
        g("Window.PalmSystem is NOT Available");
        x = {
            Request: function (y, z) {
                g(y + " invoked. But I am a dummy because PalmSystem is not available");
                if (typeof z.onFailure === "function") {
                    z.onFailure({
                        returnValue: false,
                        errorCode: "CORDOVA_ERR",
                        errorText: "PalmSystem Not Available. Cordova is not installed?"
                    })
                }
            }
        }
    }
    var s = function (y) {
        var z = j[y];
        g(JSON.stringify(z, null, 3));
        if (z && z.getEvent === true) {
            if (j[y].listenerObj) {
                j[y].listenerObj.cancel();
                j[y].getEvent = false;
                j[y].listenerObj = null
            }
        }
    };
    var k = function (z, y) {
        var A = j[z];
        if (A && typeof A.createListener === "function") {
            A.listenerObj = A.createListener(y);
            A.getEvent = true
        }
    };

    function d(z) {
        if (z.substring(0, "ext://".length) !== "ext://") {
            g("Bad prefix: " + z);
            return false
        }
        var y = z.substring("ext://".length);
        g("body is: " + y);
        var A = y.split(":");
        if (A.length === 2) {
            return A[0] + A[1]
        } else {
            if (A.length === 1) {
                return A[0]
            } else {
                g("Bad Syntax: " + z);
                return false
            }
        }
    }

    function q(y, A) {
        for (var z in y) {
            if (y[z] === A) {
                return true
            }
        }
        return false
    }

    var n = {
        FAILOVER_MODE: "failover",
        FAILOVER_PRIORITY: "failoverPriority",
        IR_OPERATION_MODE: "enableIrRemote",
        LOCALKEY_OPERATION_MODE: "enableLocalKey",
        OSD_PORTRAIT_MODE: "osdPortraitMode",
        TILE_MODE: "tileMode",
        TILE_ID: "tileId",
        TILE_ROW: "tileRow",
        TILE_COLUME: "tileCol",
        TILE_NATURALMODE: "naturalMode",
        DPM_MODE: "dpmMode",
        AUTOMATIC_STANDBY_MODE: "autoSB",
        ISM_METHOD: "ismmethod",
        SES_MODE: "smartEnergy",
        DO_15OFF_MODE: "15off",
        MONITOR_FAN: "monitorFan",
        MONITOR_SIGNAL: "monitorSignal",
        MONITOR_LAMP: "monitorLamp",
        MONITOR_SCREEN: "monitorScreen",
        MONITOR_AUDIO: "monitorAudio",
        AUDIO_SOURCE_HDMI1: "audioSourceHdmi1",
        AUDIO_SOURCE_HDMI2: "audioSourceHdmi2",
        AUDIO_SOURCE_DP: "audioSourceDp"
    };
    var o = function (y) {
        g("Create Listener for monitorTemperature");
        var z = x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/getTemperature",
            parameters: {subscribe: true},
            onSuccess: function (A) {
                g("temperature!!!!!!!!! : " + JSON.stringify(A, null, 3));
                if (A.returnValue === true) {
                    var B = {
                        source: a.MonitoringSource.THERMOMETER,
                        type: a.EventType.CURRENT_TEMPERATURE,
                        data: {temperature: A.temperature}
                    };
                    if (y) {
                        y(B)
                    }
                }
            },
            onFailure: function (A) {
                g("monitor_temperature!!!!!!!!! : FAIL " + JSON.stringify(A, null, 3))
            }
        });
        return z
    };
    var f = function (y) {
        g("Create Listener for monitorFan");
        var z = x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/getFanEvent",
            parameters: {subscribe: true},
            onSuccess: function (A) {
                g("monitor_fan!!!!!!!!! : " + JSON.stringify(A, null, 3));
                if (A.returnValue === true) {
                    var B = {source: a.MonitoringSource.FAN, type: a.EventType.FAN_STATUS, data: {status: A.fanFault}};
                    if (y) {
                        y(B)
                    }
                }
            },
            onFailure: function (A) {
                g("monitor_fan!!!!!!!!! : FAIL " + JSON.stringify(A, null, 3))
            }
        });
        return z
    };
    var h = function (y) {
        g("Create Listener for monitorLamp");
        var z = x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/getLampEvent",
            parameters: {subscribe: true},
            onSuccess: function (A) {
                g("monitor_lamp!!!!!!!!! : " + JSON.stringify(A, null, 3));
                if (A.returnValue === true) {
                    var B = {
                        source: a.MonitoringSource.LAMP,
                        type: a.EventType.LAMP_STATUS,
                        data: {status: A.lampFault}
                    };
                    if (y) {
                        y(B)
                    }
                }
            },
            onFailure: function (A) {
                g("monitor_lamp!!!!!!!!! : FAIL " + JSON.stringify(A, null, 3))
            }
        });
        return z
    };
    var m = function (y) {
        g("Create Listener for monitorSignal");
        var z = x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/getSignalEvent",
            parameters: {subscribe: true},
            onSuccess: function (A) {
                g("monitor_signal!!!!!!!!! : " + JSON.stringify(A, null, 3));
                if (A.returnValue === true) {
                    var B = {type: a.EventType.NO_SIGNAL, source: a.MonitoringSource.SIGNAL};
                    if (A.noSignal === true) {
                        B.data.status = "no_signal"
                    } else {
                        B.data.status = "signal_available"
                    }
                    if (y) {
                        y(B)
                    }
                }
            },
            onFailure: function (A) {
                g("monitor_signal!!!!!!!!! : FAIL " + JSON.stringify(A, null, 3))
            }
        });
        return z
    };
    var t = function (y) {
        g("Create Listener for monitorScreen");
        var z = x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/getScreenEvent",
            parameters: {subscribe: true},
            onSuccess: function (A) {
                g("monitor_screen!!!!!!!!! : " + JSON.stringify(A, null, 3));
                if (A.returnValue === true) {
                    var B = {
                        source: a.MonitoringSource.SCREEN,
                        type: a.EventType.SCREEN_STATUS,
                        data: {status: A.screen}
                    };
                    if (y) {
                        y(B)
                    }
                }
            },
            onFailure: function (A) {
                g("monitor_screen!!!!!!!!! FAIL : " + JSON.stringify(A, null, 3))
            }
        });
        return z
    };
    var j = {
        fan: {getEvent: false, listenerObj: null, createListener: f},
        screen: {getEvent: false, listenerObj: null, createListener: t},
        temperature: {getEvent: false, listenerObj: null, createListener: o},
        signal: {getEvent: false, listenerObj: null, createListener: m},
        lamp: {getEvent: false, listenerObj: null, createListener: h}
    };
    var p = {row: 0, col: 0};
    var a = function () {
    };
    a.UNDEFINED = "___undefined___";
    a.OsdPortraitMode = {ON: "90", OFF: "off"};
    a.AutomaticStandbyMode = {OFF: "off", STANDBY_4HOURS: "4hours"};
    a.IsmMethod = {
        NORMAL: "NORMAL",
        ORBITER: "ORBITER",
        INVERSION: "INVERSION",
        COLORWASH: "COLORWASH",
        WHITEWASH: "WHITEWASH"
    };
    a.FailoverMode = {OFF: "off", AUTO: "auto", MANUAL: "manual"};
    a.DigitalAudioInput = {HDMI_DP: "hdmi", AUDIO_IN: "audioIn"};
    a.DpmMode = {
        OFF: "off",
        POWER_OFF_5SECOND: "5sec",
        POWER_OFF_10SECOND: "10sec",
        POWER_OFF_15SECOND: "15sec",
        POWER_OFF_1MINUTE: "1min",
        POWER_OFF_3MINUTE: "3min",
        POWER_OFF_5MINUTE: "5min",
        POWER_OFF_10MINUTE: "10min"
    };
    a.KeyOperationMode = {ALLOW_ALL: "normal", POWER_ONLY: "usePwrOnly", BLOCK_ALL: "blockAll"};
    a.EventType = {
        CURRENT_TEMPERATURE: "CURRENT_TEMPERATURE",
        FAN_STATUS: "FAN_STATUS",
        LAMP_STATUS: "LAMP_STATUS",
        SCREEN_STATUS: "SCREEN_STATUS",
        SIGNAL_STATUS: "SIGNAL_STATUS"
    };
    a.MonitoringSource = {FAN: "FAN", LAMP: "LAMP", SIGNAL: "SIGNAL", SCREEN: "SCREEN", THERMOMETER: "THERMOMETER"};
    function r(B, A, C, y, z) {
        var D = {category: B, keys: A};
        x.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "get",
            parameters: D,
            onSuccess: function (E) {
                g("On Success");
                if (E.returnValue === true) {
                    var F = C(E.settings);
                    if (F === false) {
                        if (z && typeof z === "function") {
                            z({errorText: "Invalid DB value", errorCode: "DB_ERROR"})
                        }
                    } else {
                        if (y && typeof y === "function") {
                            g("successCallback!!!!!!!!!");
                            y(F)
                        } else {
                            g("successCallback not registered or is not a function: " + y)
                        }
                    }
                } else {
                    g("Settings Failed:  " + JSON.stringify(E, null, 3));
                    if (z && typeof z === "function") {
                        z({errorText: "Invalid DB value : " + E.errorText, errorCode: "DB_ERROR"})
                    }
                }
            },
            onFailure: function (E) {
                g("On Failure");
                delete E.returnValue;
                if (E.settings) {
                    g("settings = " + JSON.stringify(E.settings, null, 3));
                    var G = C(E.settings);
                    g("errorKey = " + JSON.stringify(E.errorKey, null, 3));
                    for (var F = 0; F < E.errorKey.length; ++F) {
                        G[E.errorKey[F]] = a.UNDEFINED
                    }
                    g("cbObj = " + JSON.stringify(G, null, 3));
                    if (y && typeof y === "function") {
                        g("successCallback!!!!!!!!!");
                        y(G)
                    }
                } else {
                    if (z && typeof z === "function") {
                        z({
                            errorText: ((typeof E.errorText === "undefined") ? "DB Failure" : E.errorText),
                            errorCode: "DB_ERROR"
                        })
                    }
                }
            }
        });
        g("Requested Service: luna://com.webos.service.commercial.signage.storageservice/settings/");
        g("params : " + JSON.stringify(D))
    }

    function e(D, C, y, z) {
        var E = {category: D, settings: C};
        g("settings : " + JSON.stringify(C, null, 3));
        var A = false;
        for (var B in C) {
            if (B) {
                g("has key : " + B);
                A = true;
                break
            }
        }
        if (A === false) {
            g("Nothing to set!!!!!");
            y();
            return
        }
        x.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "set",
            parameters: E,
            onSuccess: function () {
                g("On Success");
                if (y && typeof y === "function") {
                    g("SUCCEES CALLBACK!!!!!!!");
                    y()
                }
            },
            onFailure: function (F) {
                g("On Failure");
                delete F.returnValue;
                if (z && typeof z === "function") {
                    g("ERROR CALLBACK!!!!!!!");
                    z(F)
                }
            }
        });
        g("Requested Service: luna://com.webos.service.commercial.signage.storageservice/settings/");
        g("params : " + JSON.stringify(E))
    }

    a.prototype.setPortraitMode = function (y, A, D) {
        var E = {};
        var C;

        function B(G) {
            if (G.portraitMode) {
                for (var H in a.OsdPortraitMode) {
                    if (G.portraitMode === a.OsdPortraitMode[H]) {
                        return true
                    }
                }
                C = "Unrecognized OsdPortraintMode : " + G.portraitMode;
                return false
            } else {
                C = "portraitMode does not exist.";
                return false
            }
        }

        if (B(D)) {
            var z = D.portraitMode;
            g("portraitMode: " + D.portraitMode);
            E[n.OSD_PORTRAIT_MODE] = z;
            g("Set: " + JSON.stringify(E, null, 3));
            e("commercial", E, y, A);
            g("setPortraitMode Done")
        } else {
            var F = {errorCode: "BAD_PARAMETER", errorText: C};
            A(F)
        }
    };
    a.prototype.setFailoverMode = function (z, B, G) {
        var A = {};
        var C;

        function y(H) {
            g("options:" + JSON.stringify(H, null, 3));
            var K = H.failoverMode;
            if (K) {
                if (K.mode) {
                    if (K.mode === a.FailoverMode.MANUAL) {
                        if (K.priority) {
                            if (K.priority.length === 0 || typeof K.priority.length === "undefined") {
                                return false
                            } else {
                                return true
                            }
                        } else {
                            C = "priority should be present when mode is MANUAL.";
                            return false
                        }
                    } else {
                        if (K.priority) {
                            C = "This priority is available only if mode is : Signage.FailoverMode.MANUAL";
                            return false
                        } else {
                            var J = false;
                            g("Mode is: " + K.mode);
                            for (var I in a.FailoverMode) {
                                if (K.mode === a.FailoverMode[I]) {
                                    g("Matched with: " + a.FailoverMode[I]);
                                    J = true
                                }
                            }
                            if (!J) {
                                g("Unrecognized failoverMode : " + K.mode);
                                C = "Unrecognized failoverMode : " + K.mode;
                                return false
                            } else {
                                return true
                            }
                        }
                    }
                } else {
                    if (!K.priority) {
                        return true
                    } else {
                        g("Unrecognized failoverMode : " + K.mode);
                        C = "Unrecognized failoverMode : " + K.mode;
                        return false
                    }
                }
            } else {
                C = "Fail over mode not set : ";
                return false
            }
        }

        if (y(G)) {
            var E = G.failoverMode;
            if (!E.mode && !E.priority) {
                z()
            } else {
                if (E.mode === a.FailoverMode.MANUAL) {
                    x.Request("luna://com.webos.service.commercial.signage.storageservice", {
                        method: "setManualFailoverPrioirty",
                        parameters: {priority: E.priority},
                        onSuccess: function (H) {
                            g("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            if (H.returnValue) {
                                z()
                            } else {
                                g("FAILED: " + H.errorText);
                                B({errorCode: H.errorCode, errorText: H.errorText})
                            }
                        },
                        onFailure: function (H) {
                            g("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            g("FAILED: " + H.errorText);
                            B({errorCode: H.errorCode, errorText: H.errorText})
                        }
                    })
                } else {
                    if (E.mode) {
                        var F = E.mode;
                        g("mode: " + E.mode);
                        A[n.FAILOVER_MODE] = F;
                        g("Set: " + JSON.stringify(A, null, 3));
                        e("commercial", A, z, B);
                        g("setFailoverMode Done")
                    } else {
                        var D = {errorCode: "BAD_PARAMETER", errorText: "Mode should be set."};
                        B(D)
                    }
                }
            }
        } else {
            var D = {errorCode: "BAD_PARAMETER", errorText: C};
            B(D)
        }
    };
    a.prototype.getFailoverMode = function (y, z) {
        try {
            x.Request("luna://com.webos.service.commercial.signage.storageservice", {
                method: "getFailoverPrioirty",
                parameters: {},
                onSuccess: function (B) {
                    g("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    if (B.returnValue) {
                        y({priority: B.priority, mode: B.mode})
                    } else {
                        g("FAILED: " + B.errorText);
                        z({errorCode: B.errorCode, errorText: B.errorText})
                    }
                },
                onFailure: function (B) {
                    g("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    g("FAILED: " + B.errorText);
                    z({errorCode: B.errorCode, errorText: B.errorText})
                }
            })
        } catch (A) {
            g("EXCEPTION!!!!!!!!!!!!!!!!!" + A)
        }
    };
    function u(A, y) {
        var z = typeof A;
        g("mytype: " + z);
        g("type: " + y);
        if (z === "undefined") {
            return true
        } else {
            if (z === y) {
                return A
            } else {
                return false
            }
        }
    }

    a.prototype.setTileInfo = function (z, E, G) {
        var F;
        var y = function (R) {
            var H = typeof R.tileInfo.enabled;
            g("enabledType:" + H);
            if (H !== "undefined" && H !== "boolean") {
                F = "enabled should be a boolean";
                return false
            }
            var Q = R.tileInfo.row;
            var J = u(Q, "number");
            if (J === false) {
                F = "Invalid type for row" + Q;
                return false
            } else {
                if (J === true) {
                    g("Row is not defined")
                } else {
                    if (Q > 15 || Q < 1) {
                        F = "row should be 0<n<16 but :" + Q;
                        return false
                    }
                }
            }
            var K = R.tileInfo.column;
            var M = u(K, "number");
            if (M === false) {
                F = "Invalid type for column" + K;
                return false
            } else {
                if (J === true) {
                    g("column is not defined")
                } else {
                    if (K > 15 || K < 1) {
                        F = "column should be 0<n<16 but :" + K;
                        return false
                    }
                }
            }
            var I = R.tileInfo.tileId;
            var P = u(I, "number");
            if (P === false) {
                F = "Invalid type for " + K;
                return false
            } else {
                if (P === true) {
                    g("id is not defined")
                } else {
                    if (I < 1) {
                        F = "tileId should be bigger than 0 but :" + I;
                        return false
                    }
                    var N = p.row;
                    if (Q) {
                        N = Q
                    }
                    var O = p.column;
                    if (K) {
                        O = K
                    }
                    g("curRow : " + N);
                    g("curCol : " + O);
                    g("id : " + I);
                    if (I > O * N) {
                        F = "ID should be less than curRow*curCol";
                        return false
                    }
                }
            }
            var L = typeof R.tileInfo.naturalMode;
            if (L !== "undefined" && L !== "boolean") {
                F = "naturalMode should be a boolean";
                return false
            }
            return true
        };
        if (y(G) === true) {
            var A = G.tileInfo;
            var C = {};
            if (typeof A.enabled === "boolean") {
                if (A.enabled) {
                    C[n.TILE_MODE] = "on"
                } else {
                    C[n.TILE_MODE] = "off"
                }
            }
            if (A.row) {
                C[n.TILE_ROW] = A.row.toString()
            }
            if (A.column) {
                C[n.TILE_COLUME] = A.column.toString()
            }
            if (A.tileId) {
                C[n.TILE_ID] = A.tileId.toString()
            }
            if (typeof A.naturalMode === "boolean") {
                if (A.naturalMode) {
                    C[n.TILE_NATURALMODE] = "on"
                } else {
                    C[n.TILE_NATURALMODE] = "off"
                }
            }
            g("Set: " + JSON.stringify(C, null, 3));
            var D = function () {
                g("Do callback!!!!!!!!");
                if (A.row) {
                    p.row = A.row
                }
                if (A.column) {
                    p.column = A.column
                }
                if (z && typeof z === "function") {
                    g("Invoke successCallback");
                    z();
                    g("Invoked successCallback")
                }
            };
            e("commercial", C, D, E);
            g("setTileInfo Done")
        } else {
            var B = {errorCode: "BAD_PARAMETER", errorText: F};
            E(B)
        }
    };
    function l(y) {
        if (y === "on") {
            return true
        } else {
            if (y === "off") {
                return false
            } else {
                return false
            }
        }
    }

    a.prototype.getTileInfo = function (y, z) {
        var B = function (C) {
            var D = {};
            g("settings Value: " + JSON.stringify(C, null, 3));
            D.enabled = l(C[n.TILE_MODE]);
            D.row = parseInt(C[n.TILE_ROW], 10);
            D.column = parseInt(C[n.TILE_COLUME], 10);
            D.tileId = parseInt(C[n.TILE_ID], 10);
            D.naturalMode = l(C[n.TILE_NATURALMODE]);
            g("Return Value: " + JSON.stringify(D, null, 3));
            return D
        };
        var A = [n.TILE_MODE, n.TILE_ROW, n.TILE_COLUME, n.TILE_ID, n.TILE_NATURALMODE];
        r("commercial", A, B, y, z)
    };
    a.prototype.getSignageInfo = function (y, z) {
        x.Request("luna://com.webos.service.commercial.signage.storageservice/", {
            method: "getSignageInformation",
            parameters: {},
            onSuccess: function (A) {
                if (typeof y === "function") {
                    console.log(A.signageInfo);
                    y(A.signageInfo)
                }
            },
            onFailure: function (A) {
                delete A.returnValue;
                if (typeof z === "function") {
                    z(A)
                }
            }
        })
    };
    a.prototype.setIsmMethod = function (y, z, C) {
        var E = {};
        var B;

        function A(G) {
            if (G.ismMethod) {
                for (var H in a.IsmMethod) {
                    if (G.ismMethod === a.IsmMethod[H]) {
                        return true
                    }
                }
                B = "Unrecognized ismMethod  : " + G.ismMethod;
                return false
            } else {
                B = "ismMethod  does not exist.";
                return false
            }
        }

        if (A(C)) {
            if (C.ismMethod) {
                var D = C.ismMethod;
                g("ismMethod : " + D);
                E[n.ISM_METHOD] = D
            }
            g("Set: " + JSON.stringify(E, null, 3));
            e("commercial", E, y, z);
            g("setIsmMethod Done")
        } else {
            var F = {errorCode: "BAD_PARAMETER", errorText: B};
            z(F)
        }
    };
    a.prototype.setDigitalAudioInputMode = function (y, z, C) {
        var D = {};
        var B;

        function A(F) {
            if (F.digitalAudioInputList) {
                for (var G in F.digitalAudioInputList) {
                    if (G) {
                        var J = F.digitalAudioInputList[G];
                        var I = false;
                        for (var H in a.DigitalAudioInput) {
                            if (J === a.DigitalAudioInput[H]) {
                                I = true
                            }
                        }
                        if (!I) {
                            B = "Invalid Audio Input  : " + J;
                            return false
                        }
                    }
                }
                return true
            } else {
                B = "digitalAudioInputList  does not exist.";
                return false
            }
        }

        if (A(C)) {
            x.Request("luna://com.webos.service.commercial.signage.storageservice/", {
                method: "setDigitalAudioInputList",
                parameters: {digitalAudioInputList: C.digitalAudioInputList},
                onSuccess: function () {
                    if (typeof y === "function") {
                        y()
                    }
                },
                onFailure: function (F) {
                    delete F.returnValue;
                    if (typeof z === "function") {
                        z(F)
                    }
                }
            })
        } else {
            var E = {errorCode: "BAD_PARAMETER", errorText: B};
            z(E)
        }
    };
    var v = false;
    a.prototype.registerSystemMonitor = function (z, D, H) {
        var G = ["fan", "signal", "lamp", "screen", "temperature"];
        var E;
        var F = "BAD_PARAMETER";
        g("Listeners are: " + JSON.stringify(j, null, 3));
        function y(I) {
            if (v === true) {
                E = "Not ready to register monitor now.";
                F = "SYSTEM_ERROR";
                return false
            }
            g("options are: " + JSON.stringify(I, null, 3));
            if (typeof I.eventHandler !== "function") {
                E = "No event handler was given or event hadnler is not a function";
                return false
            }
            if (I.monitorConfiguration) {
                for (var K in I.monitorConfiguration) {
                    if (K) {
                        var M = false;
                        for (var J = 0; J < G.length; ++J) {
                            if (K === G[J]) {
                                g("Found key: " + G[J]);
                                M = true
                            }
                        }
                        if (!M) {
                            E = "Invalid Monitoring source  : " + K;
                            return false
                        }
                        var L = I.monitorConfiguration[K];
                        g("value: " + L);
                        if (typeof L !== "boolean") {
                            E = "Invalid value  : " + L;
                            return false
                        }
                    }
                }
                return true
            } else {
                E = "monitorConfiguration  does not exist.";
                return false
            }
        }

        if (y(H)) {
            var B = function () {
                g("Canceled all previous message subscriptions");
                var J = H.eventHandler;
                for (var I in H.monitorConfiguration) {
                    if (I) {
                        var K = H.monitorConfiguration[I];
                        if (K === true) {
                            g("Add listener for : " + I);
                            k(I, J)
                        }
                    }
                }
                g("Monitoring Setup : " + JSON.stringify(j, null, 3));
                g("Start Polling : ");
                x.Request("luna://com.webos.service.commercial.signage.storageservice", {
                    method: "systemMonitor/startMonitor",
                    parameters: {},
                    onSuccess: function (L) {
                        g("On Success");
                        if (L.returnValue === true) {
                            if (z && typeof z === "function") {
                                z()
                            }
                        } else {
                            if (D && typeof D === "function") {
                                D(L)
                            }
                        }
                        v = false
                    },
                    onFailure: function (L) {
                        g("On Failure");
                        delete L.returnValue;
                        if (D && typeof D === "function") {
                            D(L)
                        }
                        v = false
                    }
                })
            };
            var A = function (I) {
                D(I)
            };
            g("Cancel all previous message subscriptions");
            v = true;
            b(B, A)
        } else {
            var C = {errorCode: F, errorText: E};
            D(C)
        }
    };
    a.prototype.unregisterSystemMonitor = function (y, z) {
        b(y, z);
        g("After unregister, _gSystemMonitoringSetup are: " + JSON.stringify(j, null, 3))
    };
    function b(y, z) {
        g("cancelAllSubscription> setup are: " + JSON.stringify(j, null, 3));
        for (var A in j) {
            if (A) {
                s(A)
            }
        }
        g("Stop Polling");
        x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "systemMonitor/stopMonitor",
            parameters: {},
            onSuccess: function (B) {
                g("On Success");
                if (B.returnValue === true) {
                    if (y && typeof y === "function") {
                        y()
                    }
                } else {
                    if (z && typeof z === "function") {
                        z(B)
                    }
                }
            },
            onFailure: function (B) {
                g("On Failure");
                delete B.returnValue;
                if (z && typeof z === "function") {
                    z(B)
                }
            }
        })
    }

    a.prototype.getSystemMonitoringInfo = function (y, z) {
        if (j) {
            y({
                fan: j.fan.getEvent,
                signal: j.signal.getEvent,
                lamp: j.lamp.getEvent,
                screen: j.screen.getEvent,
                temperature: j.temperature.getEvent
            })
        } else {
            var A = {errorCode: "ERROR", errorText: "Failed to get system monitoring setup"};
            z(A)
        }
    };
    a.prototype.setPowerSaveMode = function (y, z, C) {
        var D = {};
        var B;

        function A(F) {
            if (F.powerSaveMode) {
                for (var G in F.powerSaveMode) {
                    if (G) {
                        var H = F.powerSaveMode[G];
                        if (G === "ses" || G === "do15MinOff") {
                            if (typeof H !== "boolean") {
                                B = "Invalid value  : " + H;
                                return false
                            }
                        } else {
                            if (G === "automaticStandby") {
                                if (!q(a.AutomaticStandbyMode, H)) {
                                    B = "Invalid automaticStandby value  : " + H;
                                    return false
                                }
                            } else {
                                if (G === "dpmMode") {
                                    if (!q(a.DpmMode, H)) {
                                        B = "Invalid dpmMode value  : " + H;
                                        return false
                                    }
                                } else {
                                    B = "Unknown value  : " + G;
                                    return false
                                }
                            }
                        }
                    }
                }
                return true
            } else {
                B = "powerSaveMode  does not exist.";
                return false
            }
        }

        if (A(C)) {
            console.log(C.powerSaveMode);
            x.Request("luna://com.webos.service.commercial.signage.storageservice", {
                method: "setPowerSaveMode",
                parameters: {mode: C.powerSaveMode},
                onSuccess: function (F) {
                    g("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    if (F.returnValue) {
                        y(F.mode)
                    } else {
                        g("FAILED: " + F.errorText);
                        z({errorCode: F.errorCode, errorText: F.errorText})
                    }
                },
                onFailure: function (F) {
                    g("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    g("FAILED: " + F.errorText);
                    z({errorCode: F.errorCode, errorText: F.errorText})
                }
            })
        } else {
            var E = {errorCode: "BAD_PARAMETER", errorText: B};
            z(E)
        }
    };
    a.prototype.getPowerSaveMode = function (B, C) {
        var A = false;
        var z = false;
        var D = false;
        var F = false;
        var y = "";
        var E = "";
        x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "getPowerSaveMode",
            parameters: {},
            onSuccess: function (G) {
                g("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                if (G.returnValue) {
                    B(G.mode)
                } else {
                    g("FAILED: " + G.errorText);
                    C({errorCode: G.errorCode, errorText: G.errorText})
                }
            },
            onFailure: function (G) {
                g("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                g("FAILED: " + G.errorText);
                C({errorCode: G.errorCode, errorText: G.errorText})
            }
        })
    };
    a.prototype.setUsagePermission = function (z, C, G) {
        var B = {};
        var D;

        function y(H) {
            if (H) {
                g("Options: " + JSON.stringify(H, null, 3))
            } else {
                g("Options not defined: " + H)
            }
            if (H.policy) {
                for (var I in H.policy) {
                    if (I) {
                        var J = H.policy[I];
                        if (I === "remoteKeyOperationMode" || I === "localKeyOperationMode") {
                            if (!q(a.KeyOperationMode, J)) {
                                D = "Invalid  KeyOperationMode value  : " + J;
                                return false
                            }
                        } else {
                            D = "Unknown value  : " + I;
                            return false
                        }
                    }
                }
                return true
            } else {
                D = "policy  does not exist.";
                return false
            }
        }

        if (y(G)) {
            if (G.policy.localKeyOperationMode) {
                var F = G.policy.localKeyOperationMode;
                g("portraitMode: " + F);
                B[n.LOCALKEY_OPERATION_MODE] = F
            }
            if (G.policy.remoteKeyOperationMode) {
                var E = G.policy.remoteKeyOperationMode;
                g("portraitMode: " + E);
                B[n.IR_OPERATION_MODE] = E
            }
            g("Set: " + JSON.stringify(B, null, 3));
            e("hotelMode", B, z, C);
            g("setPolicy Done")
        } else {
            var A = {errorCode: "BAD_PARAMETER", errorText: D};
            C(A)
        }
    };
    a.prototype.getUsagePermission = function (y, z) {
        var B = function (C) {
            var D = {};
            g("settings: " + JSON.stringify(C, null, 3));
            D.remoteKeyOperationMode = C[n.IR_OPERATION_MODE];
            D.localKeyOperationMode = C[n.LOCALKEY_OPERATION_MODE];
            g("cbObj: " + JSON.stringify(D, null, 3));
            return D
        };
        var A = [n.IR_OPERATION_MODE, n.LOCALKEY_OPERATION_MODE];
        r("hotelMode", A, B, y, z)
    };
    a.prototype.getUsageData = function (y, z) {
        var A = false;
        var B = false;
        var D = {uptime: false, totalUsed: false};

        function C() {
            g("accessResult!!!!!!!!!!!!!!!!!!");
            if (A === true && B === true) {
                g("CB Object: " + JSON.stringify(D, null, 3));
                if (D.uptime === false || D.totalUsed === false) {
                    z({errorCode: "CORDOVA_FAIL", errorText: "Failed to get usage data"});
                    return
                } else {
                    g("SUCCESS!!!!!!!!!!!!!!!!!!");
                    y(D);
                    return
                }
            } else {
                g("Not Yet!!!!!!!!!!!!!!!!!!")
            }
        }

        x.Request("luna://com.webos.service.tv.signage/", {
            method: "getUTT", parameters: {}, onSuccess: function (E) {
                g("On getUTT Success");
                A = true;
                if (E.returnValue === true) {
                    g("UTT is :" + E.UTT);
                    D.totalUsed = E.UTT
                }
                C()
            }, onFailure: function (E) {
                g("On getUTT Failure :" + JSON.stringify(E, null, 3));
                A = true;
                C()
            }
        });
        x.Request("luna://com.webos.service.tv.signage/", {
            method: "dsmp/getElapsedTime",
            parameters: {},
            onSuccess: function (E) {
                g("On getElapsedTime Success");
                B = true;
                g("result: " + JSON.stringify(E, null, 3));
                if (E.returnValue === true) {
                    var F = E.elapsedTime;
                    g("Elapsed!!: " + F);
                    D.uptime = F
                }
                C()
            },
            onFailure: function (E) {
                g("On getSystemSettings Failure " + JSON.stringify(E, null, 3));
                B = true;
                C()
            }
        })
    };
    a.prototype.captureScreen = function (y, z, A) {
        var B = {save: (A == undefined || A == null || A.save == undefined ? false : A.save)};
        if (A !== undefined && A !== null && A.thumbnail !== undefined && A.thumbnail === true) {
            B.width = 128;
            B.height = 72
        }
        x.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "captureScreen",
            parameters: B,
            onSuccess: function (C) {
                g("On Success");
                if (C.returnValue === true) {
                    y({data: C.data, size: C.size, encoding: C.encoding})
                } else {
                    z({errorCode: C.errorCode, errorText: C.errorText})
                }
            },
            onFailure: function (C) {
                g("On Failure");
                z({errorCode: C.errorCode, errorText: C.errorText})
            }
        })
    };
    a.prototype.addEventListener = k;
    a.prototype.removeEventListener = s;
    c.exports = a
});
Signage = cordova.require("cordova/plugin/signage");
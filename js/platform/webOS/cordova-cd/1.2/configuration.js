cordova.define("cordova/plugin/configuration", function (d, c, f) {
    function h(i) {
    }

    var a;
    if (window.PalmSystem) {
        h("Window.PalmSystem Available");
        a = d("cordova/plugin/webos/service")
    } else {
        a = {
            Request: function (i, j) {
                h(i + " invoked. But I am a dummy because PalmSystem is not available");
                if (typeof j.onFailure === "function") {
                    j.onFailure({returnValue: false, errorText: "PalmSystem Not Available. Cordova is not installed?"})
                }
            }
        }
    }
    var g = function () {
    };

    function b(j, k, i) {
        if (j.errorCode === undefined || j.errorCode === null) {
            j.errorCode = k
        }
        if (j.errorText === undefined || j.errorText === null) {
            j.errorText = i
        }
    }

    g.PictureMode = {
        VIVID: "vivid",
        STANDARD: "normal",
        APS: "eco",
        CINEMA: "cinema",
        GAME: "game",
        SPORTS: "sports",
        EXPERT1: "expert1",
        EXPERT2: "expert2"
    };
    g.AppMode = {LOCAL: "local", USB: "usb", REMOTE: "remote"};
    g.prototype.setPictureMode = function (i, j, k) {
        h("setPictureMode: " + JSON.stringify(k));
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "set",
            parameters: {category: "picture", settings: {pictureMode: k.mode}},
            onSuccess: function (l) {
                h("setPictureMode: On Success");
                if (l.returnValue === true) {
                    if (i && typeof i === "function") {
                        i()
                    }
                }
            },
            onFailure: function (l) {
                h("setPictureMode: On Failure");
                delete l.returnValue;
                if (j && typeof j === "function") {
                    b(l, "CSPM", "Configuration.setPictureMode returns failure.");
                    j(l)
                }
            }
        });
        h("Configuration.setPictureMode Done")
    };
    g.prototype.getPictureMode = function (i, j) {
        h("getPictureMode: ");
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "get",
            parameters: {category: "picture", keys: ["pictureMode"]},
            onSuccess: function (k) {
                h("getPictureMode: On Success");
                if (k.returnValue === true) {
                    if (i && typeof i === "function") {
                        var l = {};
                        l.mode = k.settings.pictureMode;
                        i(l)
                    }
                }
            },
            onFailure: function (k) {
                h("getPictureMode: On Failure");
                delete k.returnValue;
                if (j && typeof j === "function") {
                    b(k, "CGPM", "Configuration.getPictureMode returns failure.");
                    j(k)
                }
            }
        });
        h("Configuration.getPictureMode Done")
    };
    g.prototype.setPictureProperty = function (i, j, k) {
        h("setPictureProperty: " + JSON.stringify(k));
        var m = {};
        for (var l in k) {
            if (l !== undefined && l !== null) {
                m[l] = k[l];
                if (l === "tint" || l === "colorTemperature") {
                    m[l] -= 50
                } else {
                    if (l === "blackLevel") {
                        m[l] = {unknown: k[l]}
                    }
                }
            }
        }
        h(JSON.stringify(m));
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "set",
            parameters: {category: "picture", settings: m},
            onSuccess: function (n) {
                h("setPictureProperty: On Success");
                if (n.returnValue === true) {
                    if (i && typeof i === "function") {
                        i()
                    }
                }
            },
            onFailure: function (n) {
                h("setPictureProperty: On Failure");
                delete n.returnValue;
                if (j && typeof j === "function") {
                    b(n, "CSPP", "Configuration.setPictureProperty returns failure.");
                    j(n)
                }
            }
        });
        h("Configuration.setPictureProperty Done")
    };
    g.prototype.getPictureProperty = function (i, j) {
        h("getPictureProperty: ");
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "get",
            parameters: {
                category: "picture",
                keys: ["brightness", "contrast", "color", "tint", "backlight", "sharpness", "hSharpness", "vSharpness", "colorTemperature", "dynamicContrast", "superResolution", "colorGamut", "dynamicColor", "noiseReduction", "mpegNoiseReduction", "blackLevel", "gamma"]
            },
            onSuccess: function (k) {
                h("getPictureProperty: On Success");
                if (k.returnValue === true) {
                    if (i && typeof i === "function") {
                        var m = {};
                        for (var l in k.settings) {
                            if (l !== undefined && l !== null) {
                                m[l] = (isNaN(k.settings[l]) ? k.settings[l] : Number(k.settings[l]));
                                if (l === "tint" || l === "colorTemperature") {
                                    m[l] += 50
                                } else {
                                    if (l === "blackLevel") {
                                        m[l] = k.settings[l].unknown
                                    }
                                }
                            }
                        }
                        i(m)
                    }
                }
            },
            onFailure: function (k) {
                h("getPictureProperty: On Failure");
                delete k.returnValue;
                if (j && typeof j === "function") {
                    b(k, "CGPP", "Configuration.getPictureProperty returns failure.");
                    j(k)
                }
            }
        });
        h("Configuration.getPictureProperty Done")
    };
    var e = {alias: "signageName"};
    g.prototype.setProperty = function (i, j, l) {
        h("setProperty: " + JSON.stringify(l));
        var k = JSON.parse(l);
        var n = {};
        for (var m in k) {
            if (e[m] !== undefined) {
                n[(e[m])] = k[m]
            }
        }
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "set",
            parameters: {category: "commercial", settings: n},
            onSuccess: function (o) {
                h("setProperty: On Success");
                if (o.returnValue === true) {
                    if (i && typeof i === "function") {
                        i()
                    }
                }
            },
            onFailure: function (o) {
                h("setProperty: On Failure");
                delete o.returnValue;
                if (j && typeof j === "function") {
                    b(o, "CSP", "Configuration.setProperty returns failure.");
                    j(o)
                }
            }
        });
        h("Configuration.setProperty Done")
    };
    g.prototype.getProperty = function (j, k, m) {
        h("getProperty: ");
        var l = JSON.parse(m);
        var o = l.keys;
        var i = [];
        for (var n in o) {
            if (n !== null && n !== undefined) {
                h("key" + o[n]);
                i.push(e[o[n]])
            }
        }
        h(i);
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "get",
            parameters: {category: "commercial", keys: i},
            onSuccess: function (p) {
                h("getProperty: On Success");
                if (p.returnValue === true) {
                    if (j && typeof j === "function") {
                        var r = {};
                        for (var q in o) {
                            if (q !== null || q !== undefined) {
                                h("key" + o[q]);
                                if (p.settings[e[o[q]]] !== undefined || p.settings[e[o[q]]] !== null) {
                                    r[o[q]] = p.settings[e[o[q]]]
                                }
                            }
                        }
                        j(JSON.stringify(r))
                    }
                }
            },
            onFailure: function (p) {
                h("getProperty: On Failure");
                delete p.returnValue;
                if (k && typeof k === "function") {
                    b(p, "CGP", "Configuration.getProperty returns failure.");
                    k(p)
                }
            }
        });
        h("Configuration.getProperty Done")
    };
    g.prototype.setCurrentTime = function (j, l, m) {
        h("setCurrentTime: " + JSON.stringify(m));
        var k = new Date(m.year, m.month - 1, m.day, m.hour, m.minute, m.sec);
        if (m.year < 2000 || m.year > 2037 || k.getFullYear() !== m.year || k.getMonth() !== (m.month - 1) || k.getDate() !== m.day || k.getHours() !== m.hour || k.getMinutes() !== m.minute || k.getSeconds() !== m.sec) {
            if (typeof l === "function") {
                h("setCurrentTime: out of range or invalid parameter type");
                var i = {};
                b(i, "CSCT", "Configuration.setCurrentTime returns failure for out of range.");
                l(i);
                return
            }
        }
        h("setCurrentTime: " + k);
        var n = k.getTime() / 1000;
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "setSystemTime",
            parameters: {utc: n},
            onSuccess: function () {
                h("setCurrentTime: On Success");
                if (typeof j === "function") {
                    j()
                }
            },
            onFailure: function (o) {
                h("setCurrentTime: On Failure");
                a.Request("luna://com.palm.systemservice/time/", {
                    method: "setSystemTime",
                    parameters: {utc: n},
                    onSuccess: function () {
                        h("setCurrentTime: On Success");
                        if (typeof j === "function") {
                            j()
                        }
                    },
                    onFailure: function (p) {
                        h("setCurrentTime: On Failure");
                        delete p.returnValue;
                        if (typeof l === "function") {
                            b(p, "CSCT", "Configuration.setCurrentTime returns failure.");
                            l(p)
                        }
                    }
                })
            }
        });
        h("Configuration.setCurrentTime Done")
    };
    g.prototype.getCurrentTime = function (i, j) {
        h("getCurrentTime: ");
        a.Request("luna://com.palm.systemservice/time/", {
            method: "getEffectiveBroadcastTime", onSuccess: function (k) {
                h("getCurrentTime : On Success");
                if (k.returnValue === true) {
                    var l = {};
                    var m = new Date(k.adjustedUtc * 1000);
                    l.year = m.getFullYear();
                    l.month = m.getMonth() + 1;
                    l.day = m.getDate();
                    l.hour = m.getHours();
                    l.minute = m.getMinutes();
                    l.sec = m.getSeconds();
                    if (i && typeof i === "function") {
                        i(l)
                    }
                }
            }, onFailure: function (k) {
                h("getCurrentTime: On Failure");
                delete k.returnValue;
                if (j && typeof j === "function") {
                    b(k, "CGCT", "Configuration.getCurrentTime returns failure.");
                    j(k)
                }
            }
        });
        h("Configuration.getCurrentTime Done")
    };
    g.prototype.restartApplication = function (i, j) {
        h("restartApp: ");
        a.Request("luna://com.webos.service.commercial.signage.storageservice/", {
            method: "restart_application",
            onSuccess: function (k) {
                h("restartApp: On Success");
                if (i && typeof i === "function") {
                    i(k)
                }
            },
            onFailure: function (k) {
                h("restartApp: On Failure");
                delete k.returnValue;
                if (j && typeof j === "function") {
                    b(k, "CRA", "Configuration.restartApp returns failure.");
                    j(k)
                }
            }
        });
        h("Configuration.restartApp Done")
    };
    g.prototype.getServerProperty = function (i, j) {
        h("getServerProperty: ");
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "get",
            parameters: {
                category: "commercial",
                keys: ["serverIpPort", "siServerIp", "secureConnection", "appLaunchMode", "fqdnAddr", "fqdnMode"]
            },
            onSuccess: function (k) {
                h("getPictureProperty: On Success");
                if (k.returnValue === true) {
                    if (i && typeof i === "function") {
                        var l = {};
                        l.serverIp = k.settings.siServerIp;
                        l.serverPort = parseInt(k.settings.serverIpPort, 10);
                        l.secureConnection = (k.settings.secureConnection === "off" ? false : true);
                        l.appLaunchMode = k.settings.appLaunchMode;
                        l.fqdnMode = (k.settings.fqdnMode === "off" ? false : true);
                        l.fqdnAddr = k.settings.fqdnAddr;
                        i(l)
                    }
                }
            },
            onFailure: function (k) {
                h("getServerProperty: On Failure");
                delete k.returnValue;
                if (j && typeof j === "function") {
                    b(k, "CGSP", "Configuration.getServerProperty returns failure.");
                    j(k)
                }
            }
        });
        h("Configuration.getServerProperty Done")
    };
    g.prototype.setServerProperty = function (j, k, l) {
        h("setServerProperty: " + JSON.stringify(l));
        if (l === undefined || typeof l.serverIp !== "string" || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(l.serverIp) === false || isNaN(l.serverPort) || l.serverPort < 0 || l.serverPort > 65535 || typeof l.serverPort !== "number" || typeof l.secureConnection !== "boolean" || typeof l.appLaunchMode !== "string" || (l.appLaunchMode !== g.AppMode.USB && l.appLaunchMode !== g.AppMode.LOCAL && l.appLaunchMode !== g.AppMode.REMOTE) || typeof l.fqdnMode !== "boolean" || typeof l.fqdnAddr !== "string") {
            if (k && typeof k === "function") {
                var i = {};
                b(i, "CSSP", "Configuration.setServerProperty, Invalid parameters.");
                h("options.serverIp : " + typeof l.serverIp + " options.serverPort : " + typeof l.serverPort + " options.secureConnection : " + typeof l.secureConnection + " options.appLaunchMode : " + typeof l.appLaunchMode + " options.fqdnMode : " + typeof l.fqdnMode + " options.fqdnAddr : " + l.fqdnAddr);
                k(i);
                return
            }
        }
        var m = {};
        m.siServerIp = l.serverIp;
        m.serverIpPort = l.serverPort + "";
        m.secureConnection = (l.secureConnection === true ? "on" : "off");
        m.appLaunchMode = l.appLaunchMode;
        m.fqdnMode = (l.fqdnMode === true ? "on" : "off");
        m.fqdnAddr = l.fqdnAddr;
        h(JSON.stringify(m));
        a.Request("luna://com.webos.service.commercial.signage.storageservice/settings/", {
            method: "set",
            parameters: {category: "commercial", settings: m},
            onSuccess: function (n) {
                h("setServerProperty: On Success");
                if (n.returnValue === true) {
                    if (j && typeof j === "function") {
                        j()
                    }
                }
            },
            onFailure: function (n) {
                h("setServerProperty: On Failure");
                delete n.returnValue;
                if (k && typeof k === "function") {
                    b(n, "CSSP", "Configuration.setServerProperty returns failure.");
                    k(n)
                }
            }
        });
        h("Configuration.setServerProperty Done")
    };
    g.prototype.debug = function (i, j, k) {
        h("debug: " + k.enabled);
        a.Request("luna://com.webos.service.commercial.signage.storageservice/", {
            method: "debug",
            parameters: {enabled: k.enabled},
            onSuccess: function (l) {
                h("debug: On Success");
                if (i && typeof i === "function") {
                    i(l)
                }
            },
            onFailure: function (l) {
                h("debug: On Failure");
                delete l.returnValue;
                if (j && typeof j === "function") {
                    b(l, "CD", "Configuration.debug returns failure.");
                    j(l)
                }
            }
        });
        h("Configuration.debug Done")
    };
    f.exports = g
});
Configuration = cordova.require("cordova/plugin/configuration");
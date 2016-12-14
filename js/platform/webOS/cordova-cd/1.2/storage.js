cordova.define("cordova/plugin/storage", function (d, h, b) {
    var i; function f(k) { }

    if (window.PalmSystem) {
        f("Window.PalmSystem Available");
        i = d("cordova/plugin/webos/service")
    }
    else {
        i = {
            Request: function (k, l) {
                f(k + " invoked. But I am a dummy because PalmSystem is not available");

                if (typeof l.onFailure === "function") { l.onFailure({ returnValue: false, errorText: "PalmSystem Not Available. Cordova is not installed?" }) }
            }
        }
    }
    function g(q) {
        var p = g.options, k = p.parser[p.strictMode ? "strict" : "loose"].exec(q),
        n = {},
        l = 14; while (l--) { n[p.key[l]] = k[l] || "" }
        n[p.q.name] = {};
        n[p.key[12]].replace(p.q.parser, function (o, m, r) {
            if (m) { n[p.q.name][m] = r }
        });
        c(n);
        return n
    }
    g.options = {
        strictMode: false, key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"], q: { name: "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
        parser: { strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ }
    };
    function c(k) {
        if (k.protocol === "file") {
            if (k.host === "internal") { return a(k) }
            else {
                if (k.host === "usb") { e(k) }
                else { throw " Invalid Host: " + k.host }
            }
        }
        else {
            if (k.protocol === "http" || k.protocol === "https") {
                if (k.path.charAt(k.path.length - 1) === "/") { throw "Invalid path: " + k.path }
                else { return }
            }
            else { throw "Invalid protocol: " + k.protocol }
        }
    }
    function a(k) {
        if (k.path) {
            f("Path: " + k.path);

            if (k.path.lastIndexOf("/") > 0) { throw "Invalid internal path: " + k.path }
            else { return }
        }
        else {
            f("No Path: ");
            throw "Invalid internal path: " + k.path
        }
    }
    function e(k) {
        if (k.port) {
            if (k.port.match("/[0-9]+/")) { return { result: true } }
            else { throw "Invalid USB host: " + k.host }
        }
        else { throw "Invalid USB host: " + k.host }

        if (k.path) {
            if (k.path.charAt(k.path.length - 1) === "/") { throw "Invalid USB path: " + k.path }
            else { return { result: true } }
        }
        else { throw "Invalid USB path: " + k.path }
    }
    var j = function () { };
    j.MAX_BUFFER_LENGTH = 1024 * 10; j.AppMode = { USB: "usb", LOCAL: "local" };
    j.prototype.downloadFirmware = function (k, l, m) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "downloadFirmware", parameters: { uri: m.uri },
            onSuccess: function (n) {
                if (n.returnValue === true) { k() }
                else { l({ errorCode: n.errorCode, errorText: n.errorText }) }
            },
            onFailure: function (n) { l({ errorCode: n.errorCode, errorText: n.errorText }) }
        })
    };
    j.prototype.upgradeFirmware = function (k, l) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "upgradeFirmware", parameters: {},
            onSuccess: function (m) {
                if (m.returnValue === true) { k() }
                else { l({ errorCode: m.errorCode, errorText: m.errorText }) }
            },
            onFailure: function (m) { l({ errorCode: m.errorCode, errorText: m.errorText }) }
        })
    };
    j.prototype.getFirmwareUpgradeStatus = function (k, l) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "getFirmwareUpgradeStatus", parameters: {},
            onSuccess: function (m) {
                if (m.returnValue === true) { k({ status: m.status, upgradeProgress: m.upgradeProgress, downloadProgress: m.downloadProgress }) }
                else { l({ errorCode: m.errorCode, errorText: m.errorText }) }
            },
            onFailure: function (m) { l({ errorCode: m.errorCode, errorText: m.errorText }) }
        })
    };
    j.prototype.changeLogoImage = function (k, l, m) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "changeLogoImage", parameters: { uri: m.uri },
            onSuccess: function (n) {
                if (n.returnValue === true) { k() }
                else { l({ errorCode: n.errorCode, errorText: n.errorText }) }
            },
            onFailure: function (n) { l({ errorCode: n.errorCode, errorText: n.errorText }) }
        })
    };
    j.prototype.upgradeApplication = function (k, l, m) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "upgradeApplication", parameters: {
                from: "remote", to: (m == undefined || m == null ? j.AppMode.LOCAL : m.to),
                recovery: (m == undefined || m == null ? false : m.recovery)
            },
            onSuccess: function (n) {
                if (n.returnValue === true) { k() }
                else { l({ errorCode: n.errorCode, errorText: n.errorText }) }
            },
            onFailure: function (n) { l({ errorCode: n.errorCode, errorText: n.errorText }) }
        })
    };
    j.prototype.removeApplication = function (k, l, m) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "removeApplication", parameters: { to: m.to },
            onSuccess: function (n) {
                if (n.returnValue === true) { k() }
                else { l({ errorCode: n.errorCode, errorText: n.errorText }) }
            },
            onFailure: function (n) { l({ errorCode: n.errorCode, errorText: n.errorText }) }
        })
    };
    j.prototype.copyFile = function (k, l, m) {
        f("Options: " + JSON.stringify(m, null, 3));

        if (typeof m === "undefined" || typeof m.destination !== "string" || typeof m.source !== "string") {
            f("Bad options");
            l({ errorCode: "BAD_PARAM", errorText: JSON.stringify(m, null, 3) });
            return
        }

        if (m.maxRedirection && m.maxRedirection > 5) {
            f("Bad options");
            l({ errorCode: "BAD_PARAM", errorText: "Redirect cannot be more that 5" });
            return
        }
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "fs/copyFile", parameters: { dest: m.destination, src: m.source, maxRedirection: m.maxRedirection },
            onSuccess: function (n) {
                if (n.returnValue === true) {
                    f("SUCCESS");
                    k()
                }
                else {
                    f("Err: " + n.errorText);
                    l({ errorCode: n.errorCode, errorText: n.errorText })
                }
            },
            onFailure: function (n) {
                f("Err: " + n.errorText);
                l({ errorCode: n.errorCode, errorText: n.errorText })
            }
        })
    };
    j.prototype.removeFile = function (k, l, m) {
        if (typeof m.file !== "string") {
            l({ errorCode: "BAD_PARAM", errorText: "options.file is a mandatory parameter" });
            return
        }
        var n = { file: m.file };

        if (m.recursive === true) { n.recursive = true }
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "fs/removeFile", parameters: n, onSuccess: function (o) {
                f("onSuccess");

                if (o.returnValue === true) { k() }
                else { l({ errorCode: o.errorCode, errorText: o.errorText }) }
            },
            onFailure: function (o) {
                f("onFailure");
                l({ errorCode: o.errorCode, errorText: o.errorText })
            }
        })
    };
    j.prototype.listFiles = function (k, l, m) {
        var n = {};

        if (m && m.path) { n.pathURI = m.path }
        else { n.pathURI = "file://internal/" }
        i.Request("luna://com.webos.service.commercial.signage.storageservice/", {
            method: "fs/listFiles", parameters: n, onSuccess: function (o) {
                if (o.returnValue === true) {
                    var q = []; for (var p = 0; p < o.files.length; ++p) {
                        f(o.files[p]);
                        var s = { name: o.files[p].name, type: (o.files[p].type === "folder") ? "folder" : "file", size: o.files[p].size };
                        q.push(s)
                    }
                    var r = { files: q, totalCount: o.totalCount };
                    k(r)
                }
                else { l({ errorCode: o.errorCode, errorText: o.errorText }) }
            },
            onFailure: function (o) { l({ errorCode: o.errorCode, errorText: o.errorText }) }
        })
    };
    j.prototype.getStorageInfo = function (k, l) {
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "fs/storageInfo", parameters: {},
            onSuccess: function (m) {
                f("returned : " + JSON.stringify(m, null, 3));

                if (m.returnValue === true) {
                    f("returned : " + JSON.stringify(m, null, 3));
                    var n = { free: m.spaceInfo.freeSize, total: m.spaceInfo.totalSize, used: m.spaceInfo.usedSize, externalMemory: m.externalStorage };
                    k(n)
                }
                else { l({ errorCode: m.errorCode, errorText: m.errorText }) }
            },
            onFailure: function (m) { l({ errorCode: m.errorCode, errorText: m.errorText }) }
        })
    };
    j.prototype.mkdir = function (k, l, m) {
        if (typeof m.path !== "string") {
            l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" });
            return
        }
        var n = { pathURI: m.path };
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "fs/mkdir", parameters: n, onSuccess: function (o) {
                f("onSuccess");

                if (o.returnValue === true) { k() }
                else { l({ errorCode: o.errorCode, errorText: o.errorText }) }
            },
            onFailure: function (o) {
                f("onFailure");
                l({ errorCode: o.errorCode, errorText: o.errorText })
            }
        })
    };
    j.prototype.exists = function (k, l, m) {
        if (typeof m.path !== "string") {
            f("BAD_PARAM");
            l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" });
            return
        }
        var n = { pathURI: m.path };
        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
            method: "fs/exists", parameters: n, onSuccess: function (o) {
                f("onSuccess");

                if (o.returnValue === true) {
                    f("returned : " + JSON.stringify(o, null, 3));
                    var p = { exists: o.exists };
                    k(p)
                }
                else { l({ errorCode: o.errorCode, errorText: o.errorText }) }
            },
            onFailure: function (o) {
                f("onFailure");
                l({ errorCode: o.errorCode, errorText: o.errorText })
            }
        })
    };
    j.prototype.readFile = function (k, l, m) {
        if (!m) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
        else {
            if (!m.path) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
            else {
                if (m.length && (m.length > j.MAX_BUFFER_LENGTH || m.length < 1)) { l({ errorCode: "BAD_PARAM", errorText: "length should be > 0 and < " + j.MAX_BUFFER_LENGTH }) }
                else {
                    if (m.position && (m.position < 0)) { l({ errorCode: "BAD_PARAM", errorText: "position should be > 0" }) }
                    else {
                        var n = {};
                        n.path = m.path, n.length = m.length ? m.length : j.MAX_BUFFER_LENGTH; n.position = m.position ? m.position : 0; n.encoding = m.encoding ? m.encoding : "utf-8"; i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                            method: "fs/readFile", parameters: n, onSuccess: function (o) {
                                if (o.returnValue) {
                                    if (n.encoding === "binary") {
                                        var p = o.data; var r = new Uint8Array(p.length);
                                        for (var q = 0; q < p.length; ++q) { r[q] = p[q] }
                                        k({ data: r.buffer })
                                    }
                                    else { k({ data: o.data }) }
                                }
                                else { l({ errorCode: o.errorCode, errorText: o.errorText }) }
                            },
                            onFailure: function (o) { l({ errorCode: o.errorCode, errorText: o.errorText }) }
                        })
                    }
                }
            }
        }
    };
    j.prototype.writeFile = function (m, r, y) {
        if (!y) { r({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
        else {
            if (!y.path) { r({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
            else {
                if (!y.data) { r({ errorCode: "BAD_PARAM", errorText: "options.data is a mandatory parameter" }) }
                else {
                    if (y.mode && (y.mode !== "truncate" && y.mode !== "append" && y.mode !== "position")) { r({ errorCode: "BAD_PARAM", errorText: "mode should be 'truncate'|'append'|'position'" }) }
                    else {
                        if (y.position && (y.position < 0)) { r({ errorCode: "BAD_PARAM", errorText: "position should be > 0" }) }
                        else {
                            if (y.offset && (y.offset < 0)) { r({ errorCode: "BAD_PARAM", errorText: "offset should be > 0" }) }
                            else {
                                if (y.length && (y.length > j.MAX_BUFFER_LENGTH || y.length < 1)) { r({ errorCode: "BAD_PARAM", errorText: "length should be > 0 and < " + j.MAX_BUFFER_LENGTH }) }
                                else {
                                    if (y.encoding && (y.encoding !== "utf8" && y.encoding !== "binary" && y.encoding !== "base64")) { r({ errorCode: "BAD_PARAM", errorText: "Invalid encoding: " + y.encoding }) }
                                    else {
                                        f("REQUEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                        var o = {};
                                        o.path = y.path; o.mode = y.mode ? y.mode : "truncate"; o.position = y.position ? y.position : 0; o.encoding = y.encoding ? y.encoding : "utf8"; var p = y.offset ? y.offset : 0;
                                        if (o.encoding === "binary") {
                                            f("binary, size is: " + y.data.byteLength);
                                            var l = new Uint8Array(y.data);
                                            f("uint8View: " + l);
                                            var k = y.length ? y.length : j.MAX_BUFFER_LENGTH; var t = []; var s = 0; for (var q = p; q < l.length && s < k; ++q, s++) { t[s] = l[q] }
                                            f("array length: " + s);
                                            o.data = t; o.length = s; o.offset = 0
                                        }
                                        else {
                                            if (o.encoding === "base64") {
                                                var k = y.length ? y.length : j.MAX_BUFFER_LENGTH; f("base64, size is: " + y.data.length);
                                                var w = y.data; var x = window.atob(w);
                                                var v = x.substring(p, p + k);
                                                var u = new Uint8Array(v.length);
                                                for (q = 0; q < v.length; q++) { u[q] = v.charCodeAt(q) }
                                                var t = []; for (var q = 0; q < u.length; ++q) { t[q] = u[q] }
                                                o.data = t; o.length = t.length; o.offset = 0
                                            }
                                            else {
                                                var k = y.length ? y.length : j.MAX_BUFFER_LENGTH; o.data = y.data.substring(p, p + k);
                                                o.length = o.data.length; o.offset = 0
                                            }
                                        }
                                        try {
                                            i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                                                method: "fs/writeFile", parameters: o, onSuccess: function (z) {
                                                    f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                                                    if (z.returnValue) { m({ written: z.written }) }
                                                    else {
                                                        f("FAILED: " + z.errorText);
                                                        r({ errorCode: z.errorCode, errorText: z.errorText })
                                                    }
                                                },
                                                onFailure: function (z) {
                                                    f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                                    f("FAILED: " + z.errorText);
                                                    r({ errorCode: z.errorCode, errorText: z.errorText })
                                                }
                                            })
                                        }
                                        catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    j.prototype.statFile = function (k, l, m) {
        if (!m) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
        else {
            if (!m.path) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
            else {
                try {
                    i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                        method: "fs/statFile", parameters: { path: m.path },
                        onSuccess: function (o) {
                            f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                            if (o.returnValue) { k(o.stat) }
                            else {
                                f("FAILED: " + o.errorText);
                                l({ errorCode: o.errorCode, errorText: o.errorText })
                            }
                        },
                        onFailure: function (o) {
                            f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            f("FAILED: " + o.errorText);
                            l({ errorCode: o.errorCode, errorText: o.errorText })
                        }
                    })
                }
                catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
            }
        }
    };
    j.prototype.removeAll = function (k, l, m) {
        if (!m) { l({ errorCode: "BAD_PARAM", errorText: "options.device is a mandatory parameter" }) }
        else {
            if (!m.device) { l({ errorCode: "BAD_PARAM", errorText: "options.device is a mandatory parameter" }) }
            else {
                try {
                    i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                        method: "fs/removeAll", parameters: { device: m.device },
                        onSuccess: function (o) {
                            f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                            if (o.returnValue) { k() }
                            else {
                                f("FAILED: " + o.errorText);
                                l({ errorCode: o.errorCode, errorText: o.errorText })
                            }
                        },
                        onFailure: function (o) {
                            f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            f("FAILED: " + o.errorText);
                            l({ errorCode: o.errorCode, errorText: o.errorText })
                        }
                    })
                }
                catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
            }
        }
    };
    j.prototype.fsync = function (k, l, m) {
        try {
            var o = {};

            if (m && m.path) { o.path = m.path }
            i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                method: "fs/fsyncFile", parameters: o, onSuccess: function (p) {
                    f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                    if (p.returnValue) { k() }
                    else {
                        f("FAILED: " + p.errorText);
                        l({ errorCode: p.errorCode, errorText: p.errorText })
                    }
                },
                onFailure: function (p) {
                    f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    f("FAILED: " + p.errorText);
                    l({ errorCode: p.errorCode, errorText: p.errorText })
                }
            })
        }
        catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
    };
    j.prototype.moveFile = function (k, l, m) {
        if (!m) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
        else {
            if (!m.oldPath) { l({ errorCode: "BAD_PARAM", errorText: "options.oldpath is a mandatory parameter" }) }
            else {
                if (!m.newPath) { l({ errorCode: "BAD_PARAM", errorText: "options.newPath is a mandatory parameter" }) }
                else {
                    try {
                        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                            method: "fs/moveFile", parameters: { oldPath: m.oldPath, newPath: m.newPath },
                            onSuccess: function (o) {
                                f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                                if (o.returnValue) { k() }
                                else {
                                    f("FAILED: " + o.errorText);
                                    l({ errorCode: o.errorCode, errorText: o.errorText })
                                }
                            },
                            onFailure: function (o) {
                                f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                f("FAILED: " + o.errorText);
                                l({ errorCode: o.errorCode, errorText: o.errorText })
                            }
                        })
                    }
                    catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
                }
            }
        }
    };
    j.prototype.unzipFile = function (k, l, m) {
        if (!m) { l({ errorCode: "BAD_PARAM", errorText: "options.path is a mandatory parameter" }) }
        else {
            if (!m.zipPath) { l({ errorCode: "BAD_PARAM", errorText: "options.zipPath is a mandatory parameter" }) }
            else {
                if (!m.targetPath) { l({ errorCode: "BAD_PARAM", errorText: "options.targetPath is a mandatory parameter" }) }
                else {
                    try {
                        i.Request("luna://com.webos.service.commercial.signage.storageservice", {
                            method: "fs/unzip", parameters: { zipPath: m.zipPath, targetPath: m.targetPath },
                            onSuccess: function (o) {
                                f("onSuccess!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                                if (o.returnValue) { k() }
                                else {
                                    f("FAILED: " + o.errorText);
                                    l({ errorCode: o.errorCode, errorText: o.errorText })
                                }
                            },
                            onFailure: function (o) {
                                f("onFailure!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                f("FAILED: " + o.errorText);
                                l({ errorCode: o.errorCode, errorText: o.errorText })
                            }
                        })
                    }
                    catch (n) { f("EXCEPTION!!!!!!!!!!!!!!!!!" + n) }
                }
            }
        }
    };
    b.exports = j
});
Storage = cordova.require("cordova/plugin/storage");

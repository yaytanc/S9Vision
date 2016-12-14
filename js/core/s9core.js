'use strict';

/**
 * Created by Muratd on 02.07.2015.
 * AngularJS App.jp
 */

// samsung
var widgetAPI, tvKey, pluginAPI;
try {
    widgetAPI = new Common.API.Widget();
    tvKey = new Common.API.TVKeyValue();
    pluginAPI = new Common.API.Plugin();
} catch (e) {
    if (widgetAPI) console.error(e);
}

// ------------------------------------------------------------
// checkLocalService
// ------------------------------------------------------------
function checkLocalService(options, cb) {
    if (_platform.platform == pNativeOS) {
        AJAX('ping', 'text', {
            dsID: dsID,
            options: options,
            ServerAddress: ServerAddress,
            ServerPort: ServerPort
        }, function (err, data) {
            if (!err && data.indexOf('pong') > 0) {
                clog('Local service is running...');
                if (cb) cb();
            } else {
                dLog(Lt.error, 0, 'Local service doesn\'t run!');
                clog('Local service doesn\'t run !!!', lError);
                if (cb) cb();
            }
        });
    } else {
        clog('Luna services will use...');
        if (cb) cb();
    }
}

/*
 ------------------------------------------------------------
 execDBFunc
 ------------------------------------------------------------
 */

function execDBFunc() {
    dlList.forEach(function (o, i) {
        if (o.type == 'newsCategory' || o.type == 'xml' || o.type == 'template') dlList[i].downloaded = 'no';
    });
    downloadMediaOfTheScenes();
}

var analyzeTheSceneInProgrsss = false;
var stopTheAnaliz = false;
var tryingCount = 0;
var analyzedScenes = [];
var sceneTotal = 0;
var sceneDone = 0;

var intervalHandle_DidNotDownloadedMedias;
var chkDidNotDownloadedMediasTRY = 0;
function chkDidNotDownloadedMedias() {
    chkDidNotDownloadedMediasTRY = 0;
    intervalHandle_DidNotDownloadedMedias = ___workerTimer.setInterval(function () {
        downloadMediaOfTheScenes();
        if (++chkDidNotDownloadedMediasTRY >= 3) {
            ___workerTimer.clearInterval(intervalHandle_DidNotDownloadedMedias);
        }
    }, 15 * aMinute);
}

/*
 ------------------------------------------------------------
 Downloads
 ------------------------------------------------------------
 */
var add_dlList = function (e) {
    var r = $.grep(dlList, function (de) {
        return (de._from == e._from);
    });
    if (r.length) return -1;
    var remoteFN = e._from;
    var localFN = e._to;
    if (localFN.match(/(.eot|.svg|.ttf|.woff|.otf)/)) {
        e.font = "yes";
        localFN = pathFonts + localFN;
    } else if (e.type == 'template') {
        localFN = pathTemplates + localFN;
    } else if (localFN.toLowerCase().indexOf('.xml') > -1) {
        localFN = pathData + localFN;
    } else {
        localFN = pathFiles + localFN;
    }
    e._from = (isHTTPs(remoteFN) ? remoteFN : (e.type == 'media' ? downloadBaseURI + remoteFN : remoteFN));
    e._to = localFN;
    var tot = dlList.push(e);
    $('._downloadTotal').html(tot);
    return tot - 1;
};

function downloadMediaOfTheScenes(downloadMediaOfTheScenes_cb) {
    if (stopTheAnaliz) return;
    ___workerTimer.clearInterval(intervalHandle_DidNotDownloadedMedias);
    var dlFunc = function (dx, cb) {
        if (dx >= dlList.length || stopTheAnaliz) {
            if (cb) cb();
        } else if (dlList[dx] && dlList[dx].downloaded && typeof dlList[dx].downloaded == 'string' && dlList[dx].downloaded.match(/yes|exists/)) {
            dlFunc(++dx, function () {
                if (cb) cb();
            });
        } else {
            var _f = dlList[dx]._from;
            var _t = dlList[dx]._to;
            dlList[dx].beginDownload = moment().format('HH:mm:ss.SS');
            $('#downloadingBar').hide();
            switch (dlList[dx].type) {
                case "media":
                case "font":
                    var setTheFont = function (url) {
                        if (!url) return;
                        var ff = extractFilename(url).split('.')[0];
                        if (ff && !loadedFonts[ff]) {
                            loadedFonts[ff] = url;
                            var cssTemp = "@font-face {\n\tfont-family:\"{0}\";\n\tsrc:url(\"{1}\");\n}\n";
                            cssTemp = cssTemp.format(ff, pathPrefix4HTML + url);
                            $("#globalFonts").append(cssTemp);
                        }
                    };
                    fileExists(_t, function (exists) {
                        if (!exists) {
                            if (dlList[dx].fileid) {
                                dLog(dlList[dx].type == 'media' ? Lt.downloadMediaBegin : Lt.downloadFontBegin, dlList[dx].fileid);
                            }
                            downloadFile(_f, _t, function (remoteFileSize, resultText) {
                                var err = (remoteFileSize == -1);
                                if (err) {
                                    clog(_f + ' could not download! Result text: ' + resultText, lError);
                                    if (dlList[dx].fileid) {
                                        dLog(dlList[dx].type == 'media' ? Lt.downloadMediaError : Lt.downloadFontError, dlList[dx].fileid);
                                    }
                                    dlList[dx].downloaded = "fail";
                                    dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                                    dlFunc(++dx, function () {
                                        if (cb) cb();
                                    });
                                } else {
                                    if (dlList[dx].fileid) {
                                        dLog(dlList[dx].type == 'media' ? Lt.downloadMediaSuccess : Lt.downloadFontSuccess, dlList[dx].fileid);
                                    }
                                    dlList[dx].downloaded = "yes";
                                    dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                                    if (dlList[dx].thisIsASubFile) {
                                        templateMediaFiles[dlList[dx].thisIsASubFile.n] = dlList[dx].thisIsASubFile.o;
                                    }
                                    if (dlList[dx].font == "yes") setTheFont(_t);
                                    $('._downloadDone').html(dx + 1);
                                    dlFunc(++dx, function () {
                                        if (cb) cb();
                                    });
                                }
                            });
                        } else {
                            clog(_t + ' is already exists in storage. ', lInfo);
                            if (dlList[dx].fileid) {
                                dLog(dlList[dx].type == 'media' ? Lt.mediaExists : Lt.fontExists, dlList[dx].fileid);
                            }
                            dlList[dx].downloaded = "exists";
                            dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                            if (dlList[dx].font == "yes") setTheFont(_t);
                            if (dlList[dx].thisIsASubFile) {
                                templateMediaFiles[dlList[dx].thisIsASubFile.n] = dlList[dx].thisIsASubFile.o;
                            }
                            $('._downloadDone').html(dx + 1);
                            dlFunc(++dx, function () {
                                if (cb) cb();
                            });
                        }
                    });
                    break;
                case "newsCategory":
                case "adsCategory":
                case "funCategory":
                    var newsMi = (dlList[dx].type.substr(0, 3));
                    var ndCat = (newsMi == 'new' ? ndCats[dlList[dx].catsIndex] : (newsMi == 'ads' ? adCats[dlList[dx].catsIndex] : fbCats[dlList[dx].catsIndex]));
                    if (ndCat && ndCat.categoryId) {
                        ExecDB('', 'Device_' + (newsMi == 'new' ? 'News' : (newsMi == 'ads' ? 'Ads' : 'Funbox')) + '_List', dsID, ndCat.categoryId, (newsMi == 'ads' ? 1000 : 10), function (data, error) {
                            dlList[dx].downloaded = (error ? "fail" : "yes");
                            dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                            var news_ads = [];
                            ndCat.lastUpdate = new moment();
                            if (!error) {
                                news_ads = data.data.rows;
                                //news_ads.sort(function (a, b) {
                                //    return a.C_NEWSID - b.C_NEWSID
                                //});
                                if (news_ads && news_ads.length) {
                                    news_ads.forEach(function (nr, nri) {
                                        var existsIn_dlList = false;
                                        var __fn = extractFilename(nr.C_FILENAME);
                                        for (var inx = 0; inx < dlList.length; inx++) {
                                            if (dlList[inx]._from == nr.C_FILENAME) {
                                                existsIn_dlList = true;
                                                break;
                                            }
                                        }
                                        if (!existsIn_dlList) {
                                            add_dlList({
                                                _from: nr.C_FILENAME,
                                                _to: __fn,
                                                analyzeTime: moment().format('HH:mm:ss.SS'),
                                                downloaded: "no",
                                                beginDownload: "-----------",
                                                endDownload: "-----------",
                                                type: 'media',
                                                thisIsASubFile: {
                                                    n: __fn,
                                                    o: nr.C_FILENAME
                                                }
                                            });
                                        }
                                        news_ads[nri].C_FILENAME = pathFiles + __fn;
                                    });
                                }

                                switch (newsMi) {
                                    case 'new':
                                        ndCats[dlList[dx].catsIndex].news = news_ads;
                                        break;
                                    case 'ads':
                                        adCats[dlList[dx].catsIndex].ads = news_ads;
                                        break;
                                    case 'fun':
                                        fbCats[dlList[dx].catsIndex].fun = news_ads;
                                        break;
                                }


                                dlFunc(++dx, function () {
                                    if (cb) cb();
                                });
                            } else {
                                dLog(Lt.downloadError, (newsMi == 'new' ? 'news' : (newsMi == 'ads' ? 'ads' : 'fun')) + 'category:' + dlList[dx].catId);
                                dlFunc(++dx, function () {
                                    if (cb) cb();
                                });
                            }
                        });
                    } else {
                        clog('downloadMediaOfTheScenes: Category  veya categoryId yok!', ltError);
                        dLog(Lt.error, 0, 'downloadMediaOfTheScenes: ' + dlList[dx].type + ' boş veya categoryId\'leri yok!');
                        dlList[dx].downloaded = "fail";
                        dlFunc(++dx, function () {
                            if (cb) cb();
                        });
                    }
                    break;
                case "template":
                    if (!tryingCount) {
                        preparedTemplates[__(_f)] = '';
                        execDBArray.push({
                            type: 'template',
                            p1: _f
                        });
                    }
                    ExecDB('', 'Device_Html_Template', _f, function (r, e) {
                        dlList[dx].downloaded = e ? "fail" : "yes";
                        dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                        if (!e && r.data && r.data.rows && r.data.rows.length && r.data.rows[0].C_HTML) {
                            var tmp = r.data.rows[0].C_HTML;
                            var tempFiles = parseUrls(tmp);
                            if (tempFiles && tempFiles.length) {
                                tempFiles.forEach(function (e) {
                                    var existsIn_dlList = false;
                                    for (var inx = 0; inx < dlList.length; inx++) {
                                        if (dlList[inx]._from.indexOf(e.o) > -1) {
                                            existsIn_dlList = true;
                                            break;
                                        }
                                    }
                                    if (!existsIn_dlList) {
                                        add_dlList({
                                            _from: e.o,
                                            _to: e.n,
                                            analyzeTime: moment().format('HH:mm:ss.SS'),
                                            downloaded: "no",
                                            beginDownload: "-----------",
                                            endDownload: "-----------",
                                            type: 'media',
                                            thisIsASubFile: {
                                                n: e.n,
                                                o: e.o
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        dlFunc(++dx, function () {
                            if (cb) cb();
                        });
                    });
                    break;
                case "xml":
                    if (!tryingCount) {
                        execDBArray.push({
                            type: 'xml',
                            p1: _t,
                            p2: dsID,
                            p3: dlList[dx].dataType
                        });
                    }
                    ExecDB(_t, 'Device_XML_Data', dsID, dlList[dx].dataType, function (r, e) {
                        dlList[dx].downloaded = e ? "fail" : "yes";
                        dlList[dx].endDownload = moment().format('HH:mm:ss.SS');
                        if (dlList[dx].downloaded = "yes" && dlList[dx].dataType == 2) processWeatherData();
                        if (dlList[dx].downloaded != 'yes' || !dlList[dx].salon_id) {
                            dlFunc(++dx, function () {
                                if (cb) cb();
                            });
                        } else { // cinema
                            readFile(pathData + 'cinema.xml', 'text', function (data, err) {
                                if (!err && data) {
                                    var jData = (data.indexOf('Data_') > -1) ? JSON.parse(data).rows[0].Data_ : data;
                                    if (jData) {
                                        $cinemaXML = $(jData);
                                        $cinemaXML.find('sallon').each(function () {
                                            var $salon = $(this);
                                            $salon.find('film').each(function () {
                                                var $film = $(this);
                                                if ($film.attr('film_orjbanner')) {
                                                    add_dlList({
                                                        _from: $film.attr('film_orjbanner'),
                                                        _to: $film.attr('film_orjbanner'),
                                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                                        downloaded: "-----------",
                                                        beginDownload: "-----------",
                                                        endDownload: "-----------",
                                                        type: 'media'
                                                    });
                                                }
                                                if ($film.attr('film_dfltbanner')) {
                                                    add_dlList({
                                                        _from: $film.attr('film_dfltbanner'),
                                                        _to: $film.attr('film_dfltbanner'),
                                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                                        downloaded: "-----------",
                                                        beginDownload: "-----------",
                                                        endDownload: "-----------",
                                                        type: 'media'
                                                    });
                                                }
                                                if ($film.attr('film_trailer')) {
                                                    add_dlList({
                                                        _from: $film.attr('film_trailer'),
                                                        _to: $film.attr('film_trailer'),
                                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                                        downloaded: "-----------",
                                                        beginDownload: "-----------",
                                                        endDownload: "-----------",
                                                        type: 'media'
                                                    });
                                                }
                                            });
                                            $salon = null;
                                        });
                                    }
                                }
                                dlFunc(++dx, function () {
                                    if (cb) cb();
                                });
                            });
                        }
                    });
                    break;
                default:
                    dlFunc(++dx, function () {
                        if (cb) cb();
                    });
            }
        }
    };
    if (playStatus == 'stop') {
        $('.loading').show();
    }

    dlFunc(0, function () {
        for (var i = 0; i < dlList.length; i++) {
            if (dlList[i].downloaded == 'fail') {
                i = -1;
                break;
            }
        }
        if (i == -1 && tryingCount < 1) {
            tryingCount++;
            clog('Eksikler var; indirilememiş dosyalar. Tekrar deneyeceğim...');
            downloadMediaOfTheScenes(downloadMediaOfTheScenes_cb);
        } else {
            chkDidNotDownloadedMedias();
            analyzeTheSceneInProgrsss = false;
            if (downloadMediaOfTheScenes_cb) downloadMediaOfTheScenes_cb(!stopTheAnaliz);
        }
    });
}

/*
 ------------------------------------------------------------
 NEW* analyzeTheScene
 ------------------------------------------------------------
 */
function analyzeTheScene(sceneID, analyzeTheScene_cb) {
    if (stopTheAnaliz) {
        analyzeTheSceneInProgrsss = false;
        if (analyzeTheScene_cb) analyzeTheScene_cb(false);
    } else if (analyzeTheSceneInProgrsss && sceneID == 'theScene') {
        analyzeTheSceneInProgrsss = false;
        if (analyzeTheScene_cb) analyzeTheScene_cb(false);
    } else if (sceneID != 'theScene' && analyzedScenes.indexOf(sceneID) > -1) {
        clog('***********');
        clog('Already analyzed sceneID= ' + sceneID, lWarn);
        clog('***********');
        if (analyzeTheScene_cb) analyzeTheScene_cb(true);
    } else {
        clog(' ');
        clog('----------------------------------------------------------------------');
        clog('BEGIN sceneID= ' + sceneID);
        if (sceneID == 'theScene') {
            dLog(Lt.analyzeBegin);
            stopTheAnaliz = false;
            analyzedScenes = [];
            execDBArray = [];
            ndCats = [];
            adCats = [];
            sceneTotal = 0;
            sceneDone = 0;
            $('.YAYINYOK').detach();
            ___workerTimer.clearInterval(intervalHandle_DidNotDownloadedMedias);
            ___workerTimer.clearInterval(firstPlayIntervalHandle);
            analyzeTheSceneInProgrsss = true;
            for (var inx = dlList.length; inx > -1; inx--) {
                if (!dlList[inx] || dlList[inx].type != 'media') {
                    dlList.splice(inx, 1);
                }
            }
            if (playStatus == 'stop') {
                $('.loading').show();
            }
        }
        $('._sceneTotal').html(++sceneTotal);
        var scnTryCount = 0;
        var get_scene = function (get_scene_cb) {
            scnTryCount++;
            GetSceneFromServer(sceneID, function (data, err) {
                if (!err && !stopTheAnaliz && data && data.scene && data.scene.stage && data.scene.stage.places) {
                    var fs = parseUrls(data.scene.stage.style);
                    if (fs.length) {
                        fs.forEach(function (e) {
                            add_dlList({
                                _from: e.o,
                                _to: e.n,
                                analyzeTime: moment().format('HH:mm:ss.SS'),
                                downloaded: "-----------",
                                beginDownload: "-----------",
                                endDownload: "-----------",
                                type: 'media'
                            });
                        });
                    }

                    var placesFunc = function (inxPlace, placesFunc_cb) {
                        if (stopTheAnaliz) {
                            if (analyzeTheScene_cb) analyzeTheScene_cb();
                        } else if (inxPlace >= data.scene.stage.places.length || !data.scene.stage.places.length) {
                            if (placesFunc_cb) placesFunc_cb();
                        } else {
                            var widget = data.scene.stage.places[inxPlace];
                            var fs = parseUrls(widget.style);
                            if (fs.length) {
                                fs.forEach(function (e) {
                                    add_dlList({
                                        _from: e.o,
                                        _to: e.n,
                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                        downloaded: "-----------",
                                        beginDownload: "-----------",
                                        endDownload: "-----------",
                                        type: 'media'
                                    });
                                });
                            }

                            if (widget.templateId && widget.type.toLowerCase() != 'newsdefault' && widget.type.toLowerCase() != 'adsdefault') {
                                add_dlList({
                                    _from: widget.templateId,
                                    _to: 'Template: ' + widget.templateId,
                                    analyzeTime: moment().format('HH:mm:ss.SS'),
                                    downloaded: "-----------",
                                    beginDownload: "-----------",
                                    endDownload: "-----------",
                                    type: 'template'
                                });
                            }

                            if (widget && widget.type) {
                                switch (widget.type.toLowerCase()) {
                                    case 'scene':
                                        analyzeTheScene(widget.scene_id, function () {
                                            if (!stopTheAnaliz) {
                                                placesFunc(++inxPlace, function () {
                                                    if (placesFunc_cb) placesFunc_cb();
                                                });
                                            } else {
                                                if (placesFunc_cb) placesFunc_cb();
                                            }
                                        });
                                        break;
                                    case 'sceneplayer':
                                        var sceneplayerFunc = function (inxScenes, sceneplayerFunc_cb) {
                                            if (inxScenes >= widget.scenes.length) {
                                                if (sceneplayerFunc_cb) sceneplayerFunc_cb();
                                            } else {
                                                analyzeTheScene(widget.scenes[inxScenes].scene_id, function () {
                                                    if (!stopTheAnaliz) {
                                                        sceneplayerFunc(++inxScenes, function () {
                                                            if (sceneplayerFunc_cb) sceneplayerFunc_cb();
                                                        });
                                                    } else {
                                                        if (sceneplayerFunc_cb) sceneplayerFunc_cb();
                                                    }
                                                });
                                            }
                                        };
                                        sceneplayerFunc(0, function () {
                                            if (!stopTheAnaliz) {
                                                placesFunc(++inxPlace, function () {
                                                    if (placesFunc_cb) placesFunc_cb();
                                                });
                                            } else {
                                                if (placesFunc_cb) placesFunc_cb();
                                            }
                                        });
                                        break;
                                    case 'amedia':
                                        if (!isHTTPs(widget.source) && amIInDeviceList(widget.deviceList)) {
                                            add_dlList({
                                                _from: widget.source,
                                                _to: widget.source,
                                                analyzeTime: moment().format('HH:mm:ss.SS'),
                                                downloaded: "-----------",
                                                beginDownload: "-----------",
                                                endDownload: "-----------",
                                                fileid: widget.fileid,
                                                type: 'media'
                                            });
                                        } else if (isHTTPs(widget.source) && amIInDeviceList(widget.deviceList)) {
                                            add_dlList({
                                                _from: widget.source,
                                                _to: widget.source,
                                                analyzeTime: moment().format('HH:mm:ss.SS'),
                                                downloaded: "yes",
                                                beginDownload: moment().format('HH:mm:ss.SS'),
                                                endDownload: moment().format('HH:mm:ss.SS'),
                                                type: 'web'
                                            });
                                        }
                                        placesFunc(++inxPlace, function () {
                                            if (placesFunc_cb) placesFunc_cb();
                                        });
                                        break;
                                    case 'mediaplayer':
                                        for (var i = 0; i < widget.mediaList.length; i++)
                                            if (!isHTTPs(widget.mediaList[i].filename) && amIInDeviceList(widget.mediaList[i].deviceList)) {
                                                add_dlList({
                                                    _from: widget.mediaList[i].filename,
                                                    _to: widget.mediaList[i].filename,
                                                    analyzeTime: moment().format('HH:mm:ss.SS'),
                                                    downloaded: "-----------",
                                                    beginDownload: "-----------",
                                                    endDownload: "-----------",
                                                    fileid: widget.mediaList[i].fileid,
                                                    type: 'media'
                                                });
                                            } else if (isHTTPs(widget.mediaList[i].filename) && amIInDeviceList(widget.mediaList[i].deviceList)) {
                                                add_dlList({
                                                    _from: widget.mediaList[i].filename,
                                                    _to: widget.mediaList[i].filename,
                                                    analyzeTime: moment().format('HH:mm:ss.SS'),
                                                    downloaded: "yes",
                                                    beginDownload: moment().format('HH:mm:ss.SS'),
                                                    endDownload: moment().format('HH:mm:ss.SS'),
                                                    type: 'web'
                                                });
                                            }
                                        placesFunc(++inxPlace, function () {
                                            if (placesFunc_cb) placesFunc_cb();
                                        });
                                        break;
                                    case 'exchangedefault':
                                    case 'pricetable':
                                    case 'weatherdefault':
                                    case 'cinema':
                                    case 'cinemadefault':
                                        var lfn = widget.pricetablesource ? widget.pricetablesource : widget.source;

                                        /*
                                         -- Data Tipleri
                                         -- @Data_Type=1 => Exchange XML
                                         -- @Data_Type=2 => Weather XML
                                         -- @Data_Type=3 => Personel Special Date XML
                                         -- @Data_Type=4 => Pesonel İmage Download Rabbit
                                         -- @Data_Type=5 => Price XML
                                         -- @Data_Type=6 => Cinema Saloon Film Detail XML
                                         */

                                        if (lfn) {
                                            var dataType = -1;
                                            if (lfn.indexOf('exchange') > -1) {
                                                dataType = 1;

                                            } else if (lfn.indexOf('weather') > -1) {
                                                dataType = 2;
                                                var isp = (widget.display_flag == "1" ? "1" : "");
                                                var is_uri = getWeatherIconsServerURL(isp);
                                                for (var wi = 1; wi < 49; wi++) {
                                                    add_dlList({
                                                        _from: is_uri + wi + 'd.png',
                                                        _to: wi + 'd.png',
                                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                                        downloaded: "-----------",
                                                        beginDownload: "-----------",
                                                        endDownload: "-----------",
                                                        type: 'media'
                                                    });
                                                }
                                            } else if (lfn.indexOf('price') > -1)
                                                dataType = 5;
                                            else if (lfn.indexOf('cinema') > -1) {
                                                dataType = 6;
                                                var c_uri = 'http://' + ServerAddress + ':' + ServerPort + '/Cinema/';
                                                smartSigns.forEach(function (c) {
                                                    var c_ss = c + '.png';
                                                    add_dlList({
                                                        _from: c_uri + c_ss,
                                                        _to: c_ss,
                                                        analyzeTime: moment().format('HH:mm:ss.SS'),
                                                        downloaded: "-----------",
                                                        beginDownload: "-----------",
                                                        endDownload: "-----------",
                                                        type: 'media'
                                                    });
                                                });
                                            }
                                            if (dataType > -1) {
                                                add_dlList({
                                                    _from: lfn,
                                                    _to: lfn,
                                                    dataType: dataType,
                                                    analyzeTime: moment().format('HH:mm:ss.SS'),
                                                    downloaded: "-----------",
                                                    beginDownload: "-----------",
                                                    endDownload: "-----------",
                                                    salon_id: dataType == 6 ? widget.salon_id : "",
                                                    type: 'xml'
                                                });
                                            }
                                        }
                                        placesFunc(++inxPlace, function (isitok) {
                                            if (placesFunc_cb) placesFunc_cb(isitok);
                                        });
                                        break;
                                    case 'adsdefault':
                                    case 'newsdefault':
                                        if (widget.categories && widget.categories.length) {
                                            var newsMi = widget.type.toLowerCase() == 'newsdefault';
                                            var Cats = (newsMi ? ndCats : adCats);
                                            for (var CatsInx = 0; CatsInx < widget.categories.length; CatsInx++) {
                                                add_dlList({
                                                    _from: widget.categories[CatsInx].templateId,
                                                    _to: 'Template: ' + widget.categories[CatsInx].templateId,
                                                    analyzeTime: moment().format('HH:mm:ss.SS'),
                                                    downloaded: "-----------",
                                                    beginDownload: "-----------",
                                                    endDownload: "-----------",
                                                    type: 'template'
                                                });
                                                (function (catId) {
                                                    var r = $.grep(Cats, function (e) {
                                                        return (e.categoryId == catId);
                                                    });
                                                    if (!r.length) {
                                                        var cix = Cats.push({
                                                                categoryId: catId,
                                                                shownNewsIndex: -1,
                                                                shownAdsIndex: -1,
                                                                duration: -1,
                                                                news: [],
                                                                ads: []
                                                            }) - 1;
                                                        add_dlList({
                                                            _from: (newsMi ? 'News:' : 'Ads:') + catId,
                                                            _to: (newsMi ? 'News' : 'Ads') + ' Category: ' + catId,
                                                            catsIndex: cix,
                                                            analyzeTime: moment().format('HH:mm:ss.SS'),
                                                            downloaded: "-----------",
                                                            beginDownload: "-----------",
                                                            endDownload: "-----------",
                                                            type: newsMi ? 'newsCategory' : 'adsCategory'
                                                        });
                                                    }
                                                })(widget.categories[CatsInx].catId);
                                            }
                                            placesFunc(++inxPlace, function (isitok) {
                                                if (placesFunc_cb) placesFunc_cb(isitok);
                                            });
                                        } else {
                                            placesFunc(++inxPlace, function (isitok) {
                                                if (placesFunc_cb) placesFunc_cb(isitok);
                                            });
                                        }
                                        break;
                                    default:
                                        placesFunc(++inxPlace, function (isitok) {
                                            if (placesFunc_cb) placesFunc_cb(isitok);
                                        });
                                        break;
                                }
                            }
                        }
                    };
                    placesFunc(0, function () {
                        clog('END sceneID= ' + sceneID);
                        clog(' ');
                        $('._sceneDone').html(++sceneDone);
                        analyzedScenes.push(sceneID);
                        get_scene_cb();
                        if (sceneID == 'theScene' && !stopTheAnaliz) {
                            tryingCount = 0;
                            dLog(Lt.analyzeDone);
                            downloadMediaOfTheScenes(function () {
                                if (analyzeTheScene_cb) analyzeTheScene_cb(true);
                            });
                        } else if (analyzeTheScene_cb)
                            analyzeTheScene_cb(!stopTheAnaliz);
                    });
                } else {
                    if (!stopTheAnaliz && scnTryCount >= 3) {
                        stopTheAnaliz = true;
                        $('body').append('<div class="configError">' + (sceneID == 'theScene' ? 'ANA' : sceneID + ' nolu') + ' SAHNE HATALI!<br><br>Cihazı kapatıp/açmanız çözüm olabilir; bu da çözüm olmazsa, lütfen Sistem9 Medya teknik servis yetkilileriyle iletişime geçiniz..</div>');
                        dLog(Lt.error, 0, sceneID + ' adlı/nolu sahne üç defa indirilip analiz edilmek istendi; olmadı, başarısız!');
                    } else if (!stopTheAnaliz) {
                        clog(sceneID + ': Bu sahne indirilemedi/analiz edliemedi! Deneme: ' + scnTryCount + '/3', lWarn);
                        var t1 = ___workerTimer.setInterval(function () {
                            ___workerTimer.clearInterval(t1);
                            get_scene(get_scene_cb);
                        }, 500);
                    }
                }
            });
        };

        get_scene(function () {

        });
    }
}


/*
 analyzeTheScene('theScene', function (sceneOK) { if (sceneOK) playTheScene(); });
 */
var chk_dlList;
chk_dlList = function () {
    clog('\n----------------------------------------------------------------------------------------------------');
    clog(' analyze\t\tbeginDown\t\tendDown\t\t\tfile name');
    clog('----------------------------------------------------------------------------------------------------');
    var d = 0;
    dlList.forEach(function (c) {
        var fn = c._to ? c._to.split('/') : '';
        fn = fn[fn.length - 1];
        var s = ' ' + c.analyzeTime + '\t' + c.beginDownload + '\t\t' + c.endDownload + '\t\t' + fn + ' ';
        if (c.downloaded == 'yes' || c.downloaded == 'exists') {
            clog(s, lLog);
            d++;
        } else {
            clog(s, lWarn);
        }
    });
    clog('----------------------------------------------------------------------------------------------------');
    clog('\nTOTAL: ' + dlList.length + ', DOWNLOADED: ' + d);
    clog('----------------------------------------------------------------------------------------------------\n');
};

var shownMediaList;
shownMediaList = function () {
    if (MediaPlayerShown) {
        clog('\n\n-------------------------------------------------------------------------------------------');
        clog('Duration\tPlayed Process\t\tFile Name');
        clog('-------------------------------------------------------------------------------------------');
        for (var i in MediaPlayerShown) {
            if (MediaPlayerShown.hasOwnProperty(i)) {
                var m = MediaPlayerShown[i];
                if (m) {
                    clog((m.__duration / 1000) + 's\t\t\t' + (100 - ((m.duration / m.__duration) * 100)).toFixed(1) + '%\t\t\t' + m.filename);
                }
            }
        }
        clog('-------------------------------------------------------------------------------------------\n\n');
    }
};

/*
 ------------------------------------------------------------
 loadGadgets
 ------------------------------------------------------------
 */
function loadGadgets(cb) {
    if (gadgetsLoaded) {
        if (cb) cb();
        return;
    }
    $.ajax({
        type: "GET",
        cache: false,
        url: 'js/gadgets.list',
        success: function (data) {
            var files = data.split('\n');
            for (var i = files.length - 1; i > -1; i--) if (!files[i]) files.splice(i, 1);
            loadModules(files, function () {
                gadgetsLoaded = true;
                if (cb) cb();
            }, pathGadgets);
        },
        error: function () {
            dLog(Lt.error, 0, './js/gadgets.list dosyası okunamadı!');
            clog('./js/gadgets.list dosyası okunamadı!', true);
        }
    });
}

/*
 ------------------------------------------------------------
 Saat ve Tarih
 ------------------------------------------------------------
 */
var saatTarihIntervalHandle;
var saatBlink = ' ';

function saatTarihInterval() {
    if ($("[class*=s9]").length) {
        if ($("[class*=s9time]").length) {
            saatBlink = (saatBlink == ' ' ? ':' : ' ');
            $('.s9time').html(moment().format('HH:mm:ss'));
            $('.s9time-short').html(moment().format('HH:mm'));
            $('.s9time-short-blink').html(moment().format('HH') + '<span style="' + (saatBlink == ':' ? 'opacity: 1;' : 'opacity: 0.3;') + '">:</span>' + moment().format('mm'));
            $('.s9time-hour0').html(moment().format('H'));
            $('.s9time-hour00').html(moment().format('HH'));
            $('.s9time-minute0').html(moment().format('m'));
            $('.s9time-minute00').html(moment().format('mm'));
            $('.s9time-second0').html(moment().format('s'));
            $('.s9time-second00').html(moment().format('ss'));
        }

        if ($("[class*=s9date]").length) {
            $('.s9date').html(moment().format('DD.MM.YYYY'));
            $('.s9date-short').html(moment().format('DD.MM.YY'));
            $('.s9date-day0').html(moment().format('D'));
            $('.s9date-day00').html(moment().format('DD'));
            $('.s9date-month0').html(moment().format('M'));
            $('.s9date-month00').html(moment().format('MM'));
            $('.s9date-year00').html(moment().format('YY'));
            $('.s9date-year0000').html(moment().format('YYYY'));
            $('.s9date-dayname').each(function () {
                var lang = $(this).data('lang');
                if (!lang) lang = 'tr';
                var nextday = parseInt($(this).data('nextday'));
                if (!nextday) nextday = 0;
                $(this).html(moment().add(nextday, 'day').locale(lang).format('dddd'));
            });
            $('.s9date-monthname').each(function () {
                var lang = $(this).data('lang');
                if (!lang) lang = 'tr';
                var nextmonth = parseInt($(this).data('nextmonth'));
                if (!nextmonth) nextmonth = 0;
                $(this).html(moment().add(nextmonth, 'month').locale(lang).format('MMMM'));
            });
        }
    }
}

/*
 ------------------------------------------------------------
 STOP
 ------------------------------------------------------------
 */
function stopTheScene(cb) {
    ___workerTimer.clearInterval(saatTarihIntervalHandle);
    ___workerTimer.clearInterval(firstPlayIntervalHandle);
    ___workerTimer.clearInterval(execDBInterval);
    dLog(Lt.stop);
    openCloseCurtain('close', function () {
        clearCMDElements();
        $('.loading').hide();
        var stage = Scenes['theScene'];
        if (stage) stage = stage.stage;

        if (stage) eval(stage.type.toLowerCase() + "._destroy('" + calcMD5('Stage' + '_' + stage.id) + "')");
        for (var __id in GlobalIntervals) {
            if (GlobalIntervals.hasOwnProperty(__id)) {
                ___workerTimer.clearInterval(GlobalIntervals[__id]);
            }
        }
        $("#Stage").empty();
        playStatus = 'stop';
        preparedTemplates = [];
        $('[id^=timingDebug_]').detach();
        if (cb) cb();
    });
}


/*
 ------------------------------------------------------------
 playTheScene
 ------------------------------------------------------------
 */
function playTheScene() {
    var playfunc = function () {

        $('#sioff').detach();
        $('#metercontent').hide();
        $('.configError').detach();

        ___workerTimer.clearInterval(firstPlayIntervalHandle);
        ___workerTimer.clearInterval(execDBInterval);
        ___workerTimer.clearInterval(saatTarihIntervalHandle);

        dLog(Lt.play);
        var f = function () {
            clearCMDElements();
            $('.loading').hide();
            var theScene = lson.get('theScene');
            Scenes = []; // clear
            Scenes['theScene'] = theScene;
            ___workerTimer.setTimeout(function () {
                if (theScene == undefined || theScene == 'no' || theScene == '') {
                    clog('Bir sahne tanımlanmamış! Sunucudan bir sahne göndermesi beklenilecek.', lError);
                    dLog(Lt.error, 'Bir sahne tanımlanmamış! Sunucudan bir sahne göndermesi beklenilecek.');
                    return;
                }
                loadGadgets(function () {
                    clog('And here we go...');
                    playStatus = 'play';
                    ___workerTimer.setTimeout(function () {
                        openCloseCurtain("open");
                        if (_platform.platform == pWebOS) {
                            $('body').css({
                                "-webkit-transform": "rotate(" + 90 * ContentPortrait + "deg)",
                                "width": ContentPortrait ? "1080px" : "1920px",
                                "height": ContentPortrait ? "1920px" : "1080px"
                            });
                            $('#Stage').css({
                                "left": ContentPortrait ? "-420px" : "0",
                                "top": ContentPortrait ? "-420px" : "0"
                            });
                        }
                    }, 1000);
                    saatTarihIntervalHandle = ___workerTimer.setInterval(saatTarihInterval, 1000);
                    eval(theScene.stage.type.toLowerCase() + "._create('Stage', theScene.stage)");
                    console.log('%cshownMediaList();', 'color:blue;font-family:arial black;font-weight:bold;font-size:14px;', ' komutuyla şu an oynatılan medyaları listeleyebilirsiniz...\n\n');
                    execDBInterval = ___workerTimer.setInterval(function () {
                        execDBFunc();
                    }, aMinute * 15);
                });
            }, 100);

        };
        if (playStatus == 'play')
            openCloseCurtain("close", function () {
                stopTheScene(function () {
                    f();
                });
            });
        else
            f();
    };

    if (_platform.platform == pWebOS) {
        new Power().getPowerStatus(function (o) {
            if (o.displayMode != 'Active') {
                stopTheScene(function () {
                    $('#sioff').detach();
                    $('body').append('<div id="sioff" style="position:absolute;color:white;font-size:124px;left:20px;top:20px;z-index:10000">SCREEN is OFF!</div>');
                });
            } else {
                playfunc();
            }
        }, null);
    } else {
        playfunc();
    }
}

/*
 ------------------------------------------------------------
 readConfig
 ------------------------------------------------------------
 */
function readConfig(cb) {
    var readDone = function () {
        clog('');
        clog('');
        clog('');
        clog('');
        clog('--------------------------------------------');
        clog('dsID= ' + dsID);
        clog('--------------------------------------------');
        clog('MasterServerAddress= ' + MasterServerAddress);
        clog('MasterServerPort= ' + MasterServerPort);
        clog('--------------------------------------------');
        clog('ServerAddress= ' + ServerAddress);
        clog('ServerPort= ' + ServerPort);
        clog('--------------------------------------------');
        clog('');
        clog('');
        if (cb) cb(false);
    };
    if (_platform.isSmartTV) {
        clog('(readConfig) Platform is {0}'.format(_platform.platformName));
        dsID = localStorage.dsID;
        if (localStorage.dsID === undefined || localStorage.ServerAddress === undefined || localStorage.ServerPort === undefined || localStorage.Servers === undefined) {
            getServerInfo(function () {
                ___workerTimer.setTimeout(function () {
                    MasterServerAddress = (!localStorage.MasterServerAddress ? ServerAddress : localStorage.MasterServerAddress);
                    MasterServerPort = (!localStorage.MasterServerPort ? ServerPort : localStorage.MasterServerPort);
                    localStorage.MasterServerAddress = MasterServerAddress;
                    localStorage.MasterServerPort = MasterServerPort;
                    setServerInfo(MasterServerAddress, MasterServerPort, function () {
                        localStorage.removeItem('Servers');
                        localStorage.setItem('firstSetup', 'NO');
                        localStorage.setItem('smartTVConfig', localStorage.dsID === undefined ? 'NO' : 'OK');
                        readDone();
                    });
                }, 500);
            });
        } else {
            getServerInfo(function () {
                ___workerTimer.setTimeout(function () {
                    localStorage.firstSetup = 'OK';
                    localStorage.smartTVConfig = 'OK';
                    MasterServerAddress = localStorage.MasterServerAddress;
                    MasterServerPort = localStorage.MasterServerPort;
                    readDone();
                }, 500);
            });
        }
    } else {
        clog('readConfig. Platform is nativeOS');
        localStorage.smartTVConfig = 'OK';
        connectToServiceJS(function () {
            $.ajax({
                type: "GET",
                cache: false,
                dataType: 'json',
                url: './getConfig',
                async: false,
                success: function (data) {
                    if (data && data.resetThePlayer && data.resetThePlayer.areYouSure == 'yes') {
                        resetThePlayer(data.resetThePlayer, function () {
                            sendData2Service({"subject": "resetThePlayerOK"}, function () {
                                apiRestart();
                            });
                        });
                    } else if (!data || !data.dsID || !data.masterserverAddress || !data.masterserverPort) {
                        Config = {};
                        clog('Error in readConfig: ', true);
                        dLog(Lt.error, 0, 'Config.json\'da dsID ve/veya server bilgileri okunamadı!');
                        if (cb) cb(true);
                    } else {
                        Config = data;
                        if (!Config.selfUpgrade) Config.selfUpgrade = 'yes';
                        dsID = url_params.dsid ? url_params.dsid : Config.dsID;
                        dsIP = Config.dsIP;
                        if (url_params.virtual_directory) downloadBaseURI = url_params.virtual_directory;
                        if (url_params.dsid || localStorage.dsID != dsID) {
                            localStorage.removeItem('theScene');
                        }
                        MasterServerAddress = Config.masterserverAddress;
                        MasterServerPort = Config.masterserverPort;
                        localStorage.MasterServerAddress = MasterServerAddress;
                        localStorage.MasterServerPort = MasterServerPort;
                        if (!localStorage.ServerAddress || !localStorage.ServerPort) {
                            localStorage.ServerAddress = MasterServerAddress;
                            localStorage.ServerPort = MasterServerPort;
                            localStorage.smartTVConfig = 'OK';
                            localStorage.setItem('firstSetup', 'NO');
                        }
                        ServerAddress = localStorage.ServerAddress;
                        ServerPort = localStorage.ServerPort;
                        localStorage.dsID = dsID;
                        readDone();
                    }
                },
                error: function () {
                    clog('Config.json diskten okunamadı!', true);
                    dLog(Lt.error, 0, 'Config.json diskten okunamadı!');

                    if (cb) cb(true);
                }
            });
        });
    }
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

var url_params = getQueryParams(location.search.substring(1).toLowerCase());

// ------------------------------------------------------------
// DOCUMENT READY
// ------------------------------------------------------------
var documentReady = function () {
    if (playStatus == 'play') stopTheScene();
    stopTheAnaliz = false;
    clog('(c) 2015 Sistem 9 Medya, Digital Signage Client Application\nS9Vision Player v1.0');
    if (_platform.platform === pNoSupport) {
        clog("This platform isn't supported! ({0})".format(_platform.platformName));
        return false;
    }
    clog("Platform is " + _platform.platformName);
    clog('jsPerf= ' + jsPerf);

    /* Başlıyoruz... */
    $.getScript("js/platform/" + _platform.platformName + "/init.js")
        .done(function () {
            clog("The 'init.js' for " + _platform.platformName + " has been loaded...");
            js__modules.push('js/__release.js');
            __init(function (err) {
                if (err) {
                    clog('All modules could not load!', true);
                    dLog(Lt.error, 0, 'All modules could not load!');
                } else {
                    clog('All modules have been loaded.');
                    // yarım kalmış dosyayı siliyor.
                    if (localStorage.lastDownloadingFile) {
                        clog('Bu dosya yarım kalmış, silinecek ve baştan indirilecek: ' + localStorage.lastDownloadingFile, lWarn);
                        dLog(Lt.message, 0, 'Bu dosya yarım kalmış, silinecek ve baştan indirilecek: ' + localStorage.lastDownloadingFile);
                        DeleteFile(localStorage.lastDownloadingFile);
                        localStorage.removeItem('lastDownloadingFile');
                    }
                    api_syncFiles();
                    readConfig(function (_e) {
                        if (_platform.isSmartTV) {
                            tvi_api("get", "NetworkInfo");

                            //BURADA KALDIM
                            //LG'DE OLDUĞU GİBİ PRATİK BİR ŞEY YAP' +
                            //'ESKİYE DÖNÜK OLSUN' +
                            //'LG İÇİN BAŞKA SSSP İÇİN BAŞKA YAPMAK, ORTAK BİR KULLANIM OLACAK ŞEKİLDE HALLET' +
                            //'EVAL İLE OLACAK SANIRIM'


                            ___workerTimer.setTimeout(function () {
                                try {
                                    dsIP = TVInformation.NetworkInfo.values.wired.ipAddress ? TVInformation.NetworkInfo.values.wired.ipAddress : TVInformation.NetworkInfo.values.wifi.ipAddress;
                                } catch (e) {
                                    dsIP = 'unknown';
                                }
                                show__F1(5000, false, false);
                            }, 2000);
                            api_mkdir(pathLibrary);
                            api_mkdir(pathScenes);
                            api_mkdir(pathFiles);
                            api_mkdir(pathData);
                            api_mkdir(pathFonts);
                            api_mkdir(pathTemplates);
                        } else {
                            show__F1(5000, false, false);
                        }
                        if (_e) {
                            $('.configError').detach();
                            $('body').append('<div class="configError"><p></p><h4 style="color:cyan;"></h4></div>');
                            $('.configError p').html('Config.json bulunamadı veya hatalı!..');
                        } else if (localStorage.smartTVConfig != 'OK') {
                            $('.configError').detach();
                            $('body').append('<div class="configError"><p></p><h4 style="color:cyan;"></h4></div>');
                            if (_platform.platform == pNativeOS)
                                $('.configError p').html('Config.json bulunamadı veya hatalı!..');
                            else {
                                dLog(Lt.message, 0, 'Teknik elemendan Cihaz dsID bilgisi bekleniyor.');
                                $('.configError p').html('Lütfen Cihaz ID (dsID) bilgisini aşağıdaki kutuya yazdıktan sonra ' +
                                    '<strong>ENTER</strong> düğmesine basınız.<br>' +
                                    '<input class="inputss" id="dsID" style="width:200px;color:black; font-size:48px; font-weight:bold;padding:5px;" type="number" placeholder="dsID">');
                                var $dsID = $('#dsID');
                                $dsID.focus();
                                $dsID.on('keydown', function (e) {
                                    if (e.which == keyEnter) {
                                        var d = parseInt($(this).val());
                                        if (d) {
                                            dLog(Lt.message, 0, 'Teknik elemendan Cihaz dsID\'yi girdi: ' + d);
                                            localStorage.setItem('dsID', d);
                                            localStorage.setItem('smartTVConfig', 'OK');
                                            localStorage.setItem('firstSetup', 'NO');
                                            $('.configError').detach();
                                            documentReady();
                                        } else {
                                            $('.configError h4').html('dsID hatalı! Sadece rakam girebilir ve bu bir tam sayı olmalıdır.');
                                            dLog(Lt.error, 0, 'Teknik elemendan Cihaz dsID\'yi hatalı girdi.');
                                            $dsID.val('').focus();
                                        }
                                    }
                                });
                                $dsID = null;
                            }
                        } else if (localStorage.firstSetup != 'OK') {
                            var addr = localStorage.MasterServerAddress ? localStorage.MasterServerAddress : ServerAddress;
                            var prt = localStorage.MasterServerPort ? localStorage.MasterServerPort : 3002;
                            var uri = 'http://' + addr + ':' + prt + '/ThisIsAClient?dsID=' + localStorage.dsID;
                            $.ajax({
                                type: "GET",
                                cache: false,
                                dataType: 'json',
                                url: uri,
                                //data: {dsID: dsID},
                                async: true,
                                success: function (data) {
                                    if (data.error) {
                                        $('.configError').detach();
                                        $('body').append('<div style="font-size:32px;" class="configError">MasterServer bağlantısı başarılı fakat, hatalar var: ' + JSON.stringify(data.error) + '<br><br>' + uri + '</div>');
                                        clog('Connection has been successfully done, but there are error: ' + JSON.stringify(data.error), true);
                                        dLog(Lt.error, 0, 'MasterServer bağlantısı tamam(' + addr + ':' + prt + '), fakat hata var: ' + JSON.stringify(data.error));
                                        localStorage.firstSetup = 'NO';
                                        localStorage.smartTVConfig = 'NO';
                                    } else {
                                        lson.set('Servers', data.config.Servers);
                                        var servers = JSON.parse(localStorage.Servers);
                                        localStorage.firstSetup = 'OK';
                                        localStorage.setItem('smartTVConfig', 'OK');
                                        dLog(Lt.message, 0, 'MasterServer\'dan dsID için izin alındı! (' + localStorage.dsID + ')');
                                        setServerInfo(servers[0].server, servers[0].port, function () {
                                            $('.configError').detach();
                                            $('body').append("<img style=\"position:absolute;z-index:10000;width:100%;height:100%;\" src=\"img/s9vision_wallpaper.png\"></div>");
                                            dLog(Lt.message, 0, 'Kurulum başarılıyla gerçekleşti.');
                                            var t2 = ___workerTimer.setInterval(function () {
                                                ___workerTimer.clearInterval(t2);
                                                apiRestart();
                                            }, 5000);
                                        });
                                    }
                                },
                                error: function (err) {
                                    $('.configError').detach();
                                    $('body').append('<div style="font-size:32px;width:100%;" class="configError">MasterServer`a bağlanırken hata oldu: ' + JSON.stringify(err) +
                                        '<br><br>' +
                                        'MasterServerAddress: ' + addr + '<br>' +
                                        'MasterServerPort: ' + prt + '<br>' +
                                        'Sorgu URL`si: ' + uri +
                                        '</div>');
                                    clog('Couldn\'t connection to MasterServer. Player has been stopped!');
                                    dLog(Lt.error, 0, 'MasterServer bağlantısı yok! Kurulum tamamlanamadı. ( ' + JSON.stringify(err) + ' )');
                                    localStorage.firstSetup = 'NO';
                                    localStorage.smartTVConfig = '';
                                }
                            });
                        } else {
                            if (_platform.platform !== pNativeOS) dsID = localStorage.dsID;
                            if (localStorage.externalStorage && _platform.isSmartTV) {
                                apiAppMode(localStorage.externalStorage == 1 ? 'usb' : 'local');
                            }

                            /** // START // **/
                            clog(' ');
                            clog('**************************************************');
                            clog('dsID: {0}\nServerAddress: {1}\nServerPort: {2}'.format(dsID, ServerAddress, ServerPort));
                            clog('**************************************************');
                            clog(' ');
                            dLog(Lt.message, 0, '[Player info] dsID: {0}, ServerAddress: {1}, ServerPort: {2}'.format(dsID, ServerAddress, ServerPort));
                            checkLocalService('', function () {
                                testConnection(function (_r) {
                                    if (_r.status == 'has connection') {
                                        ServerAddress = _r.server;
                                        ServerPort = _r.port;
                                        clog('\n\nBağlantı testi yapıldı\nServerAddress: {0}\nServerPort: {1}\n\n'.format(ServerAddress, ServerPort), lWarn);
                                    }
                                    connectToServer(ServerAddress, ServerPort);
                                    if (url_params.preview) {
                                        $('body').css('overflow', 'scroll');
                                        $('body').css('cursor', 'pointer');
                                        if (url_params.preview.indexOf('.') > -1)
                                            readFile(pathScenes + url_params.preview, 'text', function (data, err) {
                                                if (!err) {
                                                    var jData = JSON.parse(data);
                                                    jData = jData.scene ? jData.scene : jData;
                                                    downloadBaseURI = jData.config && jData.config.downloadBaseURI ? jData.config.downloadBaseURI : localStorage.DownloadServer;
                                                    lson.set('theScene', jData);
                                                    var t2 = ___workerTimer.setInterval(function () {
                                                        ___workerTimer.clearInterval(t2);
                                                        analyzeTheScene('theScene', function (sceneOK) {
                                                            if (sceneOK) playTheScene();
                                                        });
                                                    }, 200);
                                                } else {
                                                    clog(url_params.preview + ' not found in disk!', true);
                                                    $('.loading').html(url_params.preview + ' bulunamadı!');
                                                }
                                            });
                                        else {
                                            ___workerTimer.clearInterval(firstPlayIntervalHandle);
                                            GetSceneFromServer(url_params.preview, function (data, err) {
                                                if (!err) {
                                                    lson.set('theScene', data.scene);
                                                    ___workerTimer.setTimeout(function () {
                                                        analyzeTheScene('theScene', function (sceneOK) {
                                                            if (sceneOK) playTheScene();
                                                        });
                                                    }, 500);
                                                } else {
                                                    clog(url_params.preview + ' couldn`t download from server!', true);
                                                    $('.loading').hide();
                                                    $('.configError').detach();
                                                    $('body').append('<div class="configError"><h1>' + url_params.preview + ' numaralı sahne sunucudan indirilemedi!</h1><h3>' + data.error + '</h3></div>');
                                                }
                                            });
                                        }
                                    } else {
                                        connectToRabbitMQ();
                                        if (localStorage.theScene) {
                                            if (firstPlayIntervalHandle) ___workerTimer.clearInterval(firstPlayIntervalHandle);
                                            firstPlayIntervalHandle = ___workerTimer.setInterval(function () {
                                                ___workerTimer.clearInterval(firstPlayIntervalHandle);
                                                analyzeTheScene('theScene', function (sceneOK) {
                                                    if (sceneOK) playTheScene();
                                                });
                                            }, 5000);
                                        } else {
                                            $('body').append('<img class="YAYINYOK" src="img/yayinyok.png"/>');
                                            dLog(Lt.message, 0, 'Yayın yok!');
                                            ___workerTimer.setTimeout(function () {
                                                if (!localStorage.theScene) sendData({"subject": "giveTheScene"});
                                            }, 2000);
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            });
        })
        .fail(function () {
            clog("ERROR in getScript: js/platform/" + _platform.platformName + "/init.js", true);
            dLog(Lt.error, 0, 'ERROR in getScript: js/platform/' + _platform.platformName + '/init.js');
        });
};

$(document).ready(function () {
    clog('Player has been started...');

    // eğer Samsung SSSP ise...
    if (widgetAPI) {
        widgetAPI.sendReadyEvent();
        keyBLUE = 22;
        keyYELLOW = 21;
        keyEnter = 29443;
    }

    window.onerror = function (error, url, line) {
        clog('!! E R R O R !! ' + error + " (" + url + ")<" + line + ">", lError);
        dLog(Lt.error, error + " (" + url + ")<" + line + ">");
    };

    try {
        dbS9 = openDatabase('S9Vision', '1.0', 'S9 Vision DB', 4 * 1024 * 1024);
    } catch (e) {
        dbS9 = null;
        clog('(ERROR) webSQL kullanılamıyor! : ' + e);
    }

    if (!dbS9) {
        clog('S9Vision veritabanı açılamadı!', lError);
    } else {
        var f = function () {
            dbS9.transaction(function (t) {
                t.executeSql('CREATE TABLE IF NOT EXISTS LOGS(ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                    'LDATE DATETIME, LTYPE INTEGER, RELEATED_ID INTEGER, DESC TEXT NOT NULL DEFAULT "*");', null, function () {
                    clog('dsS9 veritabanı açıldı...');
                    dLog(Lt.appStart);
                });
            });
        };
        if (dbS9 && (!localStorage.LOGVer || localStorage.LOGVer != 5)) {
            clog('LOGVer is different. LOG table will dropped');
            localStorage.LOGVer = 5;
            dbS9.transaction(function (t) {
                t.executeSql('DROP TABLE LOGS', null, function () {
                    f();
                });
            });
        } else {
            f();
        }
    }

    // title önemli, değiştirmeyiniz!
    document.title = "Sistem 9 Medya | S9VISION Player"; // güvenlik açısından.

    _platform = whichPlatform();

    jsPerf = performance.now();
    $('body').fadeOut(function () {
        $('body').fadeIn(function () {
            $('body').fadeOut(function () {
                $('body').fadeIn(function () {
                    jsPerf = Number(((performance.now() - jsPerf) / (_platform.isSmartTV ? 2.85 : 5.90)).toFixed());
                    if (jsPerf < 600 && _platform.isSmartTV) {
                        jsPerf = 600;
                    } else if (jsPerf < 250 && _platform.platform == pNativeOS) {
                        jsPerf = 250;
                    }
                    setDisconnectedIcon();
                    documentReady();
                });
            });
        });
    });
    jsPerf = Math.round(jsPerf);

    dLog(Lt.jsPerf, jsPerf);
    dLog(Lt.message, 0, 'Platform: ' + _platform.platformName);

    if (_platform.isSmartTV) {
        jQuery.fx.interval = 80;
        document.onkeydown = function (event) {
            var keyCode = event.keyCode;
            clog('RC keyCode: ' + keyCode);
            switch (keyCode) {
                case keyBLUE:
                    if (blueKeyIntervalHandle) {
                        ___workerTimer.clearInterval(blueKeyIntervalHandle);
                        dLog(Lt.message, 0, 'Kumandadan MAVİ tuşa basıldı! (apiRestart)');
                        apiRestart();
                        blueKeyIntervalHandle = null;
                    } else if (show__F1_intervalHandle) {
                        $('#__scrLOG').show();
                        clog('LOG Penceresi açıldı...');
                    } else {
                        blueKeyIntervalHandle = ___workerTimer.setInterval(function () {
                            ___workerTimer.clearInterval(blueKeyIntervalHandle);
                            blueKeyIntervalHandle = null;
                        }, 500);
                    }
                    break;
                case keyYELLOW:
                    dLog(Lt.message, 0, 'Kumandadan SARI tuşa basıldı! (cihaz info)');
                    show__F1(aMinute, false);
                    break;
                default:
                    break;
            }
        };
    } else {
        jQuery.fx.interval = 25;
        $('#teknikPasswd').keypress(function (e) {
            if (e.which == keyEnter) {
                show__F1(45000, true); // kapatmak için
                AJAX('teknikPasswd', '', {
                    p: $('#teknikPasswd').val(),
                    chk1: 'true',
                    chk2: 'true'
                }, function (err, data) {
                    if (err) clog('(Error in teknikPasswd) - err: ' + data, lError);
                });
            }
        });
        $('#teknik').on('shown.bs.modal', function () {
            $('#teknikPasswd').focus();
        });
        document.onkeydown = function (event) {
            var keyCode = event.keyCode;
            switch (keyCode) {
                case 112: // F1
                    dLog(Lt.message, 0, 'F1 tuşuna basıldı! (teknik login penceresi...)');
                    //$('body').css('cursor', 'pointer');
                    show__F1(aMinute, true, true);
                    event.preventDefault();
                    break;
                default:
                    break;
            }
        };
    }
});

var show__F1_intervalHandle;
function show__F1(timeout, modalbody, showLOG) {
    if (localStorage.firstSetup != 'OK') return;
    var f = function () {
        ___workerTimer.clearInterval(show__F1_intervalHandle);
        $('#teknik').modal('hide');
        $('#__scrLOG').hide();
        show__F1_intervalHandle = null;
    };

    if (show__F1_intervalHandle) {
        f();
    } else {
        if (!_platform.isSmartTV && showLOG) {
            $('#__scrLOG').show();
            clog('LOG Penceresi açıldı...');
        }
        if (modalbody) {
            $('.modal-body').show();
        } else {
            $('.modal-body, .modal-header').hide();
        }
        $('#teknikPasswd').val('');
        $('#teknik .dsID').html(dsID);
        $('#teknik .dsIP').html(dsIP);
        $('#teknik .__release').html(__release);
        $('#teknik').modal('show');
        show__F1_intervalHandle = ___workerTimer.setInterval(function () {
            f();
        }, timeout);
    }
}

function setDisconnectedIcon() {
    ___workerTimer.clearInterval(disconnectedInterval);
    $('.disconnected').fadeIn(1500).fadeOut(1500);
    disconnectedInterval = ___workerTimer.setInterval(function () {
        $('.disconnected').fadeIn(1500).fadeOut(1500);
    }, 8888);
}

function openCloseCurtain(x, cb) {
    if (!localStorage.sendConsoleLogs) localStorage.sendConsoleLogs = false;
    if ($('.curtains').length) {
        if (x == 'open') {
            $(".leftcurtain").stop().animate({width: '0'}, 1500);
            $(".rightcurtain").stop().animate({width: '0'}, 1500, function () {
                if (cb) cb();
            });
            var t2 = ___workerTimer.setInterval(function () {
                ___workerTimer.clearInterval(t2);
                $('.curtains').hide();
            }, 1750);
        } else {
            $('.curtains').show();
            $(".leftcurtain").stop().animate({width: '50%'}, 1500);
            $(".rightcurtain").stop().animate({width: '51%'}, 1500, function () {
                if (cb) cb();
            });
        }
    } else if (cb) cb();
}
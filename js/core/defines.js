/**
 * Created by Muratd on 11/08/2016.
 */

var pathLibrary = 'library/';
var pathScenes = pathLibrary + 'scenes/';
var pathFiles = pathLibrary + 'files/';
var pathGadgets = pathLibrary + 'gadgets/';
var pathTemplates = pathLibrary + 'templates/';
var pathData = pathLibrary + 'data/';
var pathFonts = pathLibrary + 'fonts/';
var dbS9;
var dsIP;
var ContentPortrait = 0;
var _platform;
var dsID;
var gadgetsLoaded = false;
var jsPerf = 300;
var timingDebug = false;
var __initOK = 'NO';
var IamSyncMaster = false;
var MyOwnReceivers = "";
var itsOwnCategories = [];
var downloadBaseURI = (localStorage.downloadBaseURI ? localStorage.downloadBaseURI : localStorage.DownloadServer);
if (!localStorage.downloadBaseURI || localStorage.downloadBaseURI == "undefined") localStorage.removeItem('theScene');

var ServerAddress;
var ServerPort;
var MasterServerAddress;
var MasterServerPort;

var GlobalIntervals = [];
var Scenes = [];
var preview = false;
var firstPlayIntervalHandle;
var inUpgrading = false;

var serviceSocket;

var loadedFonts = [];

var Config = {
    "selfUpgrade": "yes"
};

var cmdVariables = [];

var blueKeyIntervalHandle;
var keyBLUE = 406;
var keyYELLOW = 405;
var keyEnter = 13;

var templateMediaFiles = [];
var preparedTemplates = [];
var playStatus = 'stop';
var disconnectedInterval;

var dlList = [];
var execDBArray = [];
var execDBInterval;

var masterWidgetFunctions = [];
var pingTimeServer = 100;

var $cinemaXML;

var deviceBrachLocation;
var weatherTank = [];

var ndCats = [
    {
        "categoryId": "123",
        "shownNewsIndex": "-1",
        "news": [
            {"header": "", "picture": "", "categoryName": "", "detail": ""},
            {"header": "", "picture": "", "categoryName": "", "detail": ""}
        ]
    }
];
ndCats = []; // all global news categories...

var adCats = [
    {
        "categoryId": "123",
        "shownAdsIndex": "-1",
        "ads": [
            {"header": "", "picture": "", "categoryName": "", "detail": ""},
            {"header": "", "picture": "", "categoryName": "", "detail": ""}
        ]
    }
];
adCats = []; // all global ads categories...

var smartSigns = ['7', '7A', '13', '13A', '15', '15A', '18', 'GENEL', 'OLUMSUZ', 'SIDDET', 'CINSEL'];

var fbCats = [
    {
        "categoryId": "123",
        "shownAdsIndex": "-1",
        "fun": [
            {"header": "", "picture": "", "categoryName": "", "detail": ""},
            {"header": "", "picture": "", "categoryName": "", "detail": ""}
        ]
    }
];
fbCats = [];

/**
 * Created by Muratd on 10.11.2015.
 */

var tvi_count = 0;
var once1Info = [
    "NetworkInfo",
    "NetworkMacInfo",
    "PlatformInfo",
    "PowerSaveMode",
    "SystemMonitoringInfo",
    "UsagePermission"
];
var TVInformation = {
    "other": {
        "api": "special",
        "lastUpdate": "",
        "isOnlineNow": false,
        "temperature": {
            "value": 43,
            "lastUpdate": ""
        },
        "methods": {
            "get": "get"
        }
    },
    "activationDate": {
        "api": "special",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "value": ""
        }
    },
    "CurrentTime": {
        "api": "Configuration",
        "methods": {
            "set": "set",
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "year": 2015,
            "month": 5,
            "day": 25,
            "hour": 18,
            "minute": 20,
            "sec": 15
        }
    },
    "PictureProperty": {
        "api": "Configuration",
        "methods": {
            "set": "set",
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "backlight": 100,
            "blackLevel": "low",
            "brightness": 50,
            "color": 55,
            "colorGamut": "wide",
            "colorTemperature": 70,
            "contrast": 75,
            "dynamicColor": "low",
            "dynamicContrast": "low",
            "gamma": "medium",
            "hSharpness": 10,
            "mpegNoiseReduction": "low",
            "noiseReduction": "low",
            "sharpness": 20,
            "superResolution": "low",
            "tint": 50,
            "vSharpness": 10
        }
    },
    "NetworkInfo": {
        "api": "DeviceInfo",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "wifi": {"state": "disconnected"},
            "isInternetConnectionAvailable": true,
            "wired": {
                "netmask": "255.255.255.0",
                "dns1": "10.0.0.1",
                "ipAddress": "10.0.0.146",
                "onInternet": "yes",
                "method": "dhcp",
                "state": "connected",
                "gateway": "10.0.0.2",
                "interfaceName": "eth0"
            },
            "wifiDirect": {"state": "disconnected"}
        }
    },
    "NetworkMacInfo": {
        "api": "DeviceInfo",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {"wiredInfo": {"macAddress": "E8:5B:5B:7D:E7:A8"}}
    },
    "PlatformInfo": {
        "api": "DeviceInfo",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "modelName": "47LS53A-5DB",
            "serialNumber": "407KCZP1K285",
            "firmwareVersion": "03.00.44",
            "hardwareVersion": "1",
            "sdkVersion": "1.2.21391",
            "manufacturer": "LGE"
        }
    },
    "SystemUsageInfo": {
        "api": "DeviceInfo",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "memory": {"total": 976736256, "free": 130117632},
            "cpus": [{
                "model": "ARMv7 Processor rev 0 (v7l)",
                "times": {"user": 1705300, "nice": 8100, "sys": 898000, "idle": 20182400, "irq": 0}
            },
                {
                    "model": "ARMv7 Processor rev 0 (v7l)",
                    "times": {"user": 1861200, "nice": 5600, "sys": 919000, "idle": 20021900, "irq": 0}
                }]
        }
    },
    "OnTimerList": {
        "api": "Power",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {"timerList": [{"hour": 16, "minute": 15, "week": 127}]}
    },
    "OffTimerList": {
        "api": "Power",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {"timerList": [{"hour": 16, "minute": 25, "week": 127}]}
    },
    "OffTimer": {
        "api": "Power",
        "methods": {
            "set": "add",
            "delete": "delete"
        },
        "LastSet": "",
        "values": {
            "hour": 16,
            "minute": 15,
            "week": 127
        }
    },
    "OnTimer": {
        "api": "Power",
        "methods": {
            "set": "add",
            "delete": "delete"
        },
        "LastSet": "",
        "values": {
            "hour": 16,
            "minute": 25,
            "week": 127
        }
    },
    "AllOnTimer": {
        "api": "Power",
        "methods": {
            "set": "enable"
        },
        "LastSet": "",
        "values": {
            "allOnTimer": false
        }
    },
    "AllOffTimer": {
        "api": "Power",
        "methods": {
            "set": "enable"
        },
        "LastSet": "",
        "values": {
            "allOffTimer": false
        }
    },
    "PowerStatus": {
        "api": "Power",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "displayMode": "Active",
            "wakeOnLan": false,
            "allOnTimer": true,
            "allOffTimer": true
        }
    },
    "DisplayMode": {
        "api": "Power",
        "methods": {
            "set": "set"
        },
        "LastSet": "",
        "values": {
            "displayMode": "Screen Off"
        }
    },
    "captureScreen": {
        "api": "Signage",
        "methods": {
            "get": ""
        },
        "LastSet": "",
        "values": {
            "data": ""
        }
    },
    "FailoverMode": {
        "api": "Signage",
        "methods": {
            "get": "get",
            "set": "set"
        },
        "LastSet": "",
        "values": {
            "mode": "off",
            "priority": [
                "ext://hdmi:1",
                "ext://hdmi:2",
                "ext://dp:1",
                "ext://dvi:1",
                "ext://internal_memory"
            ]
        }
    },
    "PowerSaveMode": {
        "api": "Signage",
        "methods": {
            "get": "get",
            "set": "set"
        },
        "LastSet": "",
        "values": {
            "dpmMode": "10min",
            "ses": false,
            "automaticStandby": "off",
            "do15MinOff": true
        }
    },
    "SystemMonitoringInfo": {
        "api": "Signage",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "fan": false,
            "signal": false,
            "lamp": false,
            "screen": false,
            "temperature": false
        }
    },
    "UsageData": {
        "api": "Signage",
        "LastSet": "",
        "methods": {
            "get": "get"
        },
        "values": {
            "uptime": 0.143056,
            "totalUsed": 428
        }
    },
    "UsagePermission": {
        "api": "Signage",
        "methods": {
            "get": "get",
            "set": "set"
        },
        "LastSet": "",
        "values": {
            "remoteKeyOperationMode": "normal",
            "localKeyOperationMode": "normal"
        }
    },
    "SoundStatus": {
        "api": "Sound",
        "methods": {
            "get": "get"
        },
        "LastSet": "",
        "values": {
            "level": 18,
            "muted": false,
            "externalSpeaker": true
        }
    },
    "VolumeLevel": {
        "api": "Sound",
        "methods": {
            "set": "set"
        },
        "LastSet": "",
        "values": {
            "level": 15
        }
    },
    "Muted": {
        "api": "Sound",
        "methods": {
            "set": "set"
        },
        "values": {
            "muted": false
        }
    },
    "StorageInfo": {
        "api": "Storage",
        "LastSet": "",
        "methods": {
            "get": "get"
        },
        "values": {
            "free": "3606980",
            "total": "4574372",
            "used": "951008",
            "externalMemory": {}
        }
    },
    "listFiles": {
        "api": "Storage",
        "methods": {
            "get": ""
        },
        "LastSet": "",
        "values": {
            "totalCount": 2,
            "files": [
                {
                    "name": "butterfly.jpg",
                    "type": "file",
                    "size": 57,
                    "atime": "2015-05-22T10:08:39.000Z",
                    "mtime": "2015-05-18T16:21:09.000Z",
                    "ctime": "2015-05-18T16:21:09.000Z"
                }
            ]
        }
    }
};
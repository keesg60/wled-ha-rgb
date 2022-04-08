var config = {
    devices: [
        {id: 0, entity: "hass.light.entityname", color: [0,0,0] }
    ],
    hass: {
        host:"homeassistant.local:8123",
        token: ""
    },
    brightness_calcs: {
        "bt709": { maj: null, min: null, r: 0.2126, g: 0.7152, b:0.0722 },
        "bt601": { maj: null, min: null, r: 0.299, g: 0.587, b: 0.114 },
        "hsp": { maj: "sqrt", min: "^2", r: 0.299, g: 0.587, b: 0.114 },
        "avg": { maj: "avg" }
    },
    brightness_calc: "bt709",
    debug: false,
    rest_port: 8989,
    xres: {
        "state": {
            "on": false,
            "bri": 127,
            "transition": 7,
            "ps": -1,
            "pl": -1,
            "nl": {
            "on": false,
            "dur": 60,
            "fade": true,
            "tbri": 0
        },
        "udpn": {
            "send": false,
            "recv": true
        },
        // "seg": [{
        //   "start": 0,
        //   "stop": 1,
        //   "len": 1,
        //   "col": [
        //     [255, 160, 0, 0],
        //     [0, 0, 0, 0],
        //     [0, 0, 0, 0]
        //   ],
        //   "fx": 0,
        //   "sx": 127,
        //   "ix": 127,
        //   "pal": 0,
        //   "sel": true,
        //   "rev": false,
        //   "cln": -1
        // }]
        },
        "info": {
            "ver": "0.8.4",
            "vid": 1903252,
            "leds": {
            "count": 0,
            "rgbw": false,
            "pin": [2],
            "pwr": 0,
            "maxpwr": 65000,
            "maxseg": 1
        },
        "name": "WLED Light",
        "udpport": 19446,
        "live": true,
        "fxcount": 80,
        "palcount": 47,
        "arch": "esp8266",
        "core": "2_4_2",
        "freeheap": 13264,
        "uptime": 17985,
        "opt": 127,
        "brand": "WLED",
        "product": "DIY light",
        "btype": "src",
        "mac": "",
        "ip": ""
        },
        "effects": [
            "Solid", "Blink", "Breathe", "Wipe", "Wipe Random", "Random Colors", "Sweep", "Dynamic", "Colorloop", "Rainbow",
            "Scan", "Dual Scan", "Fade", "Chase", "Chase Rainbow", "Running", "Saw", "Twinkle", "Dissolve", "Dissolve Rnd",
            "Sparkle", "Dark Sparkle", "Sparkle+", "Strobe", "Strobe Rainbow", "Mega Strobe", "Blink Rainbow", "Android", "Chase", "Chase Random",
            "Chase Rainbow", "Chase Flash", "Chase Flash Rnd", "Rainbow Runner", "Colorful", "Traffic Light", "Sweep Random", "Running 2", "Red & Blue","Stream",
            "Scanner", "Lighthouse", "Fireworks", "Rain", "Merry Christmas", "Fire Flicker", "Gradient", "Loading", "In Out", "In In",
            "Out Out", "Out In", "Circus", "Halloween", "Tri Chase", "Tri Wipe", "Tri Fade", "Lightning", "ICU", "Multi Comet",
            "Dual Scanner", "Stream 2", "Oscillate", "Pride 2015", "Juggle", "Palette", "Fire 2012", "Colorwaves", "BPM", "Fill Noise", "Noise 1",
            "Noise 2", "Noise 3", "Noise 4", "Colortwinkle", "Lake", "Meteor", "Smooth Meteor", "Railway", "Ripple"
        ],
            "palettes": [
            "Default", "Random Cycle", "Primary Color", "Based on Primary", "Set Colors", "Based on Set", "Party", "Cloud", "Lava", "Ocean",
            "Forest", "Rainbow", "Rainbow Bands", "Sunset", "Rivendell", "Breeze", "Red & Blue", "Yellowout", "Analogous", "Splash",
            "Pastel", "Sunset 2", "Beech", "Vintage", "Departure", "Landscape", "Beach", "Sherbet", "Hult", "Hult 64",
            "Drywet", "Jul", "Grintage", "Rewhi", "Tertiary", "Fire", "Icefire", "Cyane", "Light Pink", "Autumn",
            "Magenta", "Magred", "Yelmag", "Yelblu", "Orange & Teal", "Tiamat", "April Night"
        ]
    }
}

module.exports = config;
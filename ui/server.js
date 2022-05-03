
var express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
var app = express();
const fs = require('fs');
const path = require('path');
var wled_ha_rgb = require(path.join("..", "main.js"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get('/', (req, res) => {
    var wp = fs.readFileSync('index.html').toString();
    
    res.send(wp);
});

router.get('/client.js', (req, res) => {
    res.sendFile('client.js', {root: '.'});
});

router.post('/setconfig', (req, res) => {
    var config_path = path.join("..", "config.json");
    if(!fs.existsSync(config_path)) {
        fs.copyFileSync(path.join("..", "config_template.json"), config_path);
    }
    var config_string = fs.readFileSync(config_path);
    var config = JSON.parse(config_string);
    config.devices =  req.body.devices;
    config.hass =  req.body.hass;
    config.brightness_calc =  req.body.brightness_calc;
    config.debug =  req.body.debug;
    config.rest_port =  req.body.rest_port;
    var set_config_string = JSON.stringify(config);
    fs.writeFileSync(config_path, set_config_string);
    if(wled_ha_rgb.running) {
        wled_ha_rgb.restart();
    }
    else {
        wled_ha_rgb.main();
    }
    res.send("Config set!");
});

router.get('/getconfig', (req, res) => {
    var config_path = path.join("..", "config.json");
    if(!fs.existsSync(config_path)) {
        fs.copyFileSync(path.join("..", "config_template.json"), config_path);
    }
    var config_string = fs.readFileSync(config_path);

    res.send(config_string);
});

app.use('/', router);

var restport = 3299;
app.listen(restport, () => {
    console.log(`Server running on port ${restport}`);
});
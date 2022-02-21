var udp = require('dgram');
var udpserver = udp.createSocket('udp4');
var udp_ready = false;

var network = require('network');
var config = require('./config.js');

var express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
var app = express();
//Hyperion doesn't set a content-type head on PUT requests, so we insert it.
app.use((req, res, next) => {
  req.headers['content-type'] = 'application/json';
  next();
});
app.use(express.json());
app.use('/', router);
var restport = 80;
var webserver_ready = false

var WebSocketClient = require('websocket').client;
var wclient = new WebSocketClient();
var globalconnection;
var webs_ready = false;
var webs_id = 0;

var all_ready = false;

config.xres.info.count = config.devices.length;
network.get_interfaces_list((err, list) => {
  var found = false;
  if(!err) {
    for(var i = 0; i < list.length; i++) {
      var interface = list[i];
      if(interface.status == 'active') {
        config.xres.info.mac = interface.mac_address.replace(/:/g,'');
        config.xres.info.ip = interface.ip_address;
        console.log(`Using interface ${interface.name}, ${interface.ip_address}`);
        found = true;
        break;
      }
    }
  }
  if(!found) {
    console.log("No active network interfaces found!");
  }
});

arraysEqual = (arr1, arr2) => {
  if(arr1.length == arr2.length) {
    for(var i = 0; i < arr1.length; i++) {
      if(arr1[i] != arr2[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

getWebsCommand = (color, light, enable, id) => {
  return JSON.stringify({
    "id": id,
    "type": "call_service",
    "domain": "light",
    "service": enable ? "turn_on" : "turn_off",
    "service_data": {
      "rgb_color": color
    },
    "target": {
      "entity_id": light
    }
  });
}

checkready = () => {
  if(udp_ready && webs_ready && webserver_ready) {
    all_ready = true;
    console.log("All services ready.")
  }
}

//WLED JSON Webserver
router.put('/json/state', (req, res) => {
    console.log("Hyperion HTTP: LED State:", JSON.stringify(req.body.on));
    config.xres.state.on = req.body.on;
    config.xres.info.live = req.body.live;
    if(!config.xres.state.on && webs_ready) {
      for(var d = 0; d < config.devices.length; d++) {
        config.devices[d].color = [0,0,0];
        globalconnection.send(JSON.stringify(getWebsCommand(config.devices[d].color, config.devices[d].name, false, webs_id++)));
      }
    }
    res.send(JSON.stringify(config.xres));
});

app.listen(restport, () => {
  console.log(`WLED JSON Server running on port ${restport}`);
  webserver_ready = true;
  checkready();
});

//Hyperion "WLED" UDP Server
udpserver.on("message", (msg, info) => {
  if(config.xres.state.on && webs_ready && config.devices.length <= msg.length / 3) {
    var start = 0;
    for(var d = 0; d < config.devices.length; d++) {
      var color = [];
      var end = start + 3;
      for(i = start; i < end; i++) {
        color.push(msg[i]);
      }
      if(!arraysEqual(config.devices[d].color, color)) {
        webs_id++
        config.devices[d].color = color;
        //console.log(`Updating ID ${d}'s color, ID: ${webs_id}`);
        var webscmd = getWebsCommand(config.devices[d].color, config.devices[d].name, true, webs_id);
        globalconnection.send(webscmd);
      }
      start = end;
    }
  }
});

udpserver.on("listening", () => {
  console.log("Hyperion UDP Server Listening...");
  udp_ready = true;
  checkready();
});
udpserver.on('error', (err) => {
  console.log(`Hyperion UDP server error:\n${err.stack}`);
  udpserver.close();
});
udpserver.bind(config.xres.info.udpport);

//HASS Websocket Control
wclient.on("connect", (connection) => {
  console.log("HASS Websocket Connected.");
  if(connection) {
    connection.on("message", (msg) => {
      var message = JSON.parse(msg.utf8Data);
      var rmsg;
      if(message.type == "auth_required") {
        console.log("HASS Websocket Auth requested...");
        rmsg = JSON.stringify({
          "type": "auth",
          "access_token": config.hass.token
        });
        connection.send(rmsg)
      }
      if(message.type == "auth_ok") {
        console.log("HASS Websocket Auth Completed");
        webs_ready = true;
        globalconnection = connection;
        checkready();
      }
    });
  }
});

wclient.on("error", (err) => {
  console.log(`HASS Websocket ERRER: ${JSON.stringify(err)}`);
});

wclient.on('connectFailed', (error) => {
  console.log('Connect Error: ' + error.toString());
});

wclient.connect(`ws://${config.hass.host}/api/websocket`);

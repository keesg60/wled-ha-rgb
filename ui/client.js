var device_counter = 0;
var entities = [];
var config = [];
var websocket = null;
document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        getConfig();
        var add_device_btn = document.getElementById("add_device_btn");
        
        add_device_btn.onclick = (e) => {
            
            if(device_counter == 0) {
                var device_container = document.getElementById("device_container");
                device_container.innerHTML = "";
            }
            buildDevice("", true);
        }

        var get_entities_btn = document.getElementById("get_entities");
        get_entities_btn.onclick = (e) => {
            getEntities();
        };

        var send_config_btn = document.getElementById("send_config");
        send_config_btn.onclick = (e) => {
            var config = {};

            config.hass = {
                host: document.getElementById("hass_host").value,
                token: document.getElementById("hass_token").value
            };

            config.brightness_calc = document.getElementById("bcalcs").value;
            config.rest_port= parseInt(document.getElementById("wled_http_port").value);
            config.debug = document.getElementById("debug").checked;
            
            var device_inps = document.getElementsByTagName("select");
            config.devices = [];
            for(didx in device_inps) {
                var device_inp = device_inps[didx];
                if(device_inp.id && device_inp.id.indexOf("entity_inp") != -1)
                {  
                    var id = parseInt(device_inp.id.split(/_/g)[2]);

                    var matched_entity = getEntityName(device_inp.value);

                    config.devices.push({
                        id: id,
                        entity: matched_entity,//device_inp.value,
                        color: [0,0,0],
                        brightness: 0
                    })
                }

            }
            setConfig("setconfig", config);
        }
    }
}

setConfig = (cmd, data) => {
    addLog("Setting Config...")
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/${cmd}`;
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            addLog(xhr.responseText + '<BR>');
            showDebug(data.debug);
        }
    });
    xhr.send(JSON.stringify(data));
}

getConfig = () => {
    addLog("Config Retrieval...");
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/getconfig`;
    xhr.open("GET", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            addLog("Config Retrieved!");
            config = JSON.parse(xhr.responseText);

            document.getElementById("bcalcs").value = config.brightness_calc;
            document.getElementById("wled_http_port").value =  config.rest_port;
            document.getElementById("debug").checked = config.debug;    
            document.getElementById("hass_token").value = config.hass.token;

            getEntities();
        }
    });
    xhr.send();
}

getFriendlyName = (entity) => {
    for(var e = 0; e < entities.length; e++) {
        if(entities[e].entity == entity) {
            return entities[e].friendly_name;
        }
    }
}

getEntityName = (friendly_name) => {
    for(var i = 0; i < entities.length; i++) {
        if(entities[i].friendly_name == friendly_name) {
            return entities[i].entity;
        }
    }
}

addLog = (text) => {
    var log_container = document.getElementById('log');
    log_container.innerHTML += text + "<BR>";
}

showDebug = (show) => {
    var debug_container = document.getElementById("debug_container");
    debug_container.className = show ? "shown border-centered appwidth" : "hidden";
    websCB = (event) => {
        var data = JSON.parse(event.data);
        var log = "";
        debug_container.innerHTML = "";
        data.devices.forEach((k,v) => {
            log += `<tr><td>${getFriendlyName(k.entity)}</td> <td>${k.color}</td><td>${k.brightness}</td></tr>`;
        });
        debug_container.innerHTML = `Debug Data:<BR><table><tr><th style="width:200px; text-align:start;">Device</th><th style="width:100px; text-align:start;">RGB</th><th style="width:200px; text-align:start;">Brightness</th></tr>${log}</table>`;
    }
    if(show) {
        websocket = new WebSocket(`ws://${window.location.hostname}:3298`);
        websocket.addEventListener("open", function (event) {
            console.log("Socket opened.");
        });
        websocket.addEventListener("message", websCB);
    }
    else {
        if(websocket) {
            websocket.close();
            websocket.removeEventListener("message", websCB);
        }
    }
}

getEntities = () => {
    addLog("HASS Entities Retrieval...");
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/getentities`;
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            entities = JSON.parse(xhr.responseText);
            var device_container = document.getElementById("device_container");
            if(entities.length > 0) {
                addLog("HASS Entities Retrieved!");
                showDebug(config.debug);
                device_container.innerHTML = "";
                device_counter = 0; 
                if(config.devices) {
                    var device_found = false;
                    for(d in config.devices)
                    {
                        var entity = config.devices[d].entity;
                        if(entity != "") { 
                            var friendly_name = getFriendlyName(entity);
                            buildDevice(friendly_name, true);
                            device_found = true;
                        }
                    }
                }
            }
            else
            {
                addLog("No entities retrieved. Check HASS config here and HASS for compatible lights.");
            }
            if(!device_found) {
                device_container.innerHTML = "No devices configured."
                for(var e = 0; e < entities; e++) {
                    buildDevice("", true);
                }
            }
        }
    });
    var hassconfig = {
        host: document.getElementById("hass_host").value,
        token: document.getElementById("hass_token").value
    };
    xhr.send(JSON.stringify(hassconfig));
}

buildDevice = (value = "", pulldown = false) => {
    var device_container = document.getElementById("device_container");
    var label = document.createElement("span");
    label.id = `entity_label_${device_counter}`;
    label.innerHTML = `LED ID: ${device_counter} - HASS Light `
    device_container.appendChild(label);
    
    if(!pulldown) {
        var new_device_inp = document.createElement("input");
        new_device_inp.id = `entity_inp_${device_counter}`;
        new_device_inp.type = "text";
        new_device_inp.value = value;
        device_container.appendChild(new_device_inp);
    }
    else {
        var new_device_inp = document.createElement("select");
        new_device_inp.id = `entity_inp_${device_counter}`;
        new_device_inp.name = `entity_inp_${device_counter}`;
        var select = device_container.appendChild(new_device_inp);
        for(e in entities) {
            var entity = entities[e];
            var option = document.createElement("option");
            option.value = entity.friendly_name;
            option.innerHTML = entity.friendly_name;
            select.appendChild(option);
        }
        select.value = value;
    }

    var new_device_del_btn = document.createElement("button");
    new_device_del_btn.id = `entity_del_btn_${device_counter}`;
    new_device_del_btn.innerHTML = "Remove";
    device_container.appendChild(new_device_del_btn);
    new_device_del_btn.onclick = function(e) {
        var ddevice_container = document.getElementById("device_container");
        var dlabel = document.getElementById(label.id);
        ddevice_container.removeChild(dlabel);
        var dinput = document.getElementById(new_device_inp.id);
        ddevice_container.removeChild(dinput);
        var del_btn = document.getElementById(new_device_del_btn.id);
        ddevice_container.removeChild(del_btn);
        var brs = ddevice_container.getElementsByTagName("br");
        ddevice_container.removeChild(brs[brs.length - 1]);
        device_counter--;
    };

    var br = document.createElement("br");
    device_container.appendChild(br);
    device_counter++;
}
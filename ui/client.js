var device_counter = 0;
var entities = [];
document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        getConfig();
        var add_device_btn = document.getElementById("add_device_btn");
        
        add_device_btn.onclick = (e) => {
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
                    config.devices.push({
                        id: id,
                        entity: device_inp.value,
                        color: [0,0,0]
                    })
                }

            }
            setConfig("setconfig", config);
        }
    }
}

function setConfig(cmd, data) {
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/${cmd}`;
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            document.getElementById('log').innerHTML += xhr.responseText + '<BR>';
        }
    });
    xhr.send(JSON.stringify(data));
}

function getConfig() {
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/getconfig`;
    xhr.open("GET", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            var config = JSON.parse(xhr.responseText);

            document.getElementById("bcalcs").value = config.brightness_calc;
            document.getElementById("wled_http_port").value =  config.rest_port;
            document.getElementById("debug").checked = config.debug;    
            document.getElementById("hass_token").value = config.hass.token;    
            getEntities(config.devices);
        }
    });
    xhr.send();
}

function getEntities(devices = null) {
    document.getElementById('log').innerHTML += 'HASS Entities Retrieval...<BR>';
    var xhr = new XMLHttpRequest();
    var endpoint = `http://${window.location.hostname}:${window.location.port}/getentities`;
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (ev) => {
        if(xhr.readyState == 4) {
            document.getElementById('log').innerHTML += 'HASS Entities Retrieved!<BR>';
            entities = JSON.parse(xhr.responseText);
            if(entities.length > 0) {
                if(devices) {
                    for(d in devices)
                    {
                        buildDevice(devices[d].entity, true);
                    }
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

function buildDevice(value = "", pulldown = false) {
    var device_container = document.getElementById("device_container");
    var label = document.createElement("span");
    label.id = `entity_label_${device_counter}`;
    label.innerHTML = `LED ID: ${device_counter}, HASS Entity `
    device_container.appendChild(label);
    
    if(!pulldown) {
        var new_device_inp = document.createElement("input");
        new_device_inp.id = `entity_inp_${device_counter}`;
        new_device_inp.type = "text";
        new_device_inp.value = value;
        device_container.appendChild(new_device_inp);
    }
    else {
        //if(document.getElementById(`entity_select_${}`))
        var new_device_inp = document.createElement("select");
        new_device_inp.id = `entity_inp_${device_counter}`;
        new_device_inp.name = `entity_inp_${device_counter}`;
        var select = device_container.appendChild(new_device_inp);
        for(e in entities) {
            var entity = entities[e];
            var option = document.createElement("option");
            option.value = entity;
            option.innerHTML = entity;
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
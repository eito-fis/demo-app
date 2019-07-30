
function closeWindow(){
    overwolf.windows.getCurrentWindow(function(result){
        if (result.status=="success"){
            overwolf.windows.close(result.window.id);
        }
    });
};

function minimize(){
    overwolf.windows.getCurrentWindow(function(result){
        if (result.status=="success"){
            overwolf.windows.minimize(result.window.id);
        }
    });
};

function toggleMaximize(){
    let element = document.querySelector('.maximize-restore-selector'),
        root = document.documentElement;

    overwolf.windows.getCurrentWindow(function(result){
        if (result.status !== "success") {
            return;
        }

        if (element.checked) {
            overwolf.windows.restore(result.window.id);
            root.classList.remove('maximized');
        } else {
            overwolf.windows.maximize(result.window.id);
            root.classList.add('maximized');
        }
    });
};

function showSupport() {
    window.location.href = "overwolf://settings/support";
};

// --- LOGGING TESTING ---
// Global log list that will hold all actions
var log = []

// Object to store key value, x and y and whether or not it was on a
// game window or overwolf widget
function Action(key, x, y, on_game) {
    this.key = key;
    this.x = x;
    this.y = y;
    this.on_game = on_game;
}

// Quick function to update the data div with our current log
function updateDiv() {
    text = JSON.stringify(log);
    document.getElementById("data").innerHTML = text;
}

function pushData() {
    // Push data to server here!
    log = []
}

// Store 0 for mouse clock and current mouse location on mouse
// button press
overwolf.games.inputTracking.onMouseDown.addListener(
    function(mouse_value) {
        log.push(new Action(0,
            mouse_value.x,
            mouse_value.y,
            mouse_value.onGame));
    }
);

// TODO: Clean up this mess
// Store key value for keyboard press and mouse location at key
// press
overwolf.games.inputTracking.onKeyDown.addListener(
    function(key_value) {
        overwolf.games.inputTracking.getMousePosition(
            function(mouse_pos_value) {
                log.push(new Action(key_value.key,
                    mouse_pos_value.x,
                    mouse_pos_value.y,
                    key_value.onGame));
            }
        );
    }
);


//Overwolf game events
var g_interestedInFeatures = [
    'teams',
    'matchState',
    'kill',
    'death',
    'respawn',
    'assist',
    'minions',
    'level',
    'abilities',
    'announcer',
    'counters',
    'match_info'
];

function registerEvents() {
    // general events errors
    overwolf.games.events.onError.addListener(function(info) {
        console.log("Error: " + JSON.stringify(info));
        plugin.get().writeLocalAppDataFile("error.txt", JSON.stringify(info), function(status, message)
            {
                console.log(arguments);
            });
    });

    // "static" data changed (total kills, username, steam-id)
    // This will also be triggered the first time we register
    // for events and will contain all the current information
    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
        console.log("Info UPDATE: " + JSON.stringify(info));
    });

    // an event triggerd
    overwolf.games.events.onNewEvents.addListener(function(info) {
        console.log("EVENT FIRED: " + JSON.stringify(info));
        for (let event of info) {
            eventDispatcher(event);
        }
    });
}

function eventDispatcher(event) {
    // Reset log and start API calls on match start
    if (event.name == "matchStart") {
        log = [];
        // Push log data every minute
        var interval = setInterval(pushData(), 60000);
        return;
    }
    if (event.name == "matchEnd") {
        pushData();
        clearInterval(interval);
    }
    // Add data we care about to log here
}


// Overwolf code to register game events when league is booted up or the app is ran
function gameLaunched(gameInfoResult) {
    if (!gameInfoResult) {
        return false;
    }
    if (!gameInfoResult.gameInfo) {
        return false;
    }
    if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
        return false;
    }
    if (!gameInfoResult.gameInfo.isRunning) {
        return false;
    }
    // NOTE: we divide by 10 to get the game class id without it's sequence number
    if (Math.floor(gameInfoResult.gameInfo.id/10) != 5426) {
        return false;
    }

    console.log("LoL Launched");
    return true;

}

function gameRunning(gameInfo) {
    if (!gameInfo) {
        return false;
    }
    if (!gameInfo.isRunning) {
        return false;
    }
    // NOTE: we divide by 10 to get the game class id without it's sequence number
    if (Math.floor(gameInfo.id/10) != 5426) {
        return false;
    }

    console.log("LoL running");
    return true;

}


function setFeatures() {
    overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
        if (info.status == "error")
        {
            console.log("Could not set required features: " + info.reason);
            console.log("Trying in 2 seconds");
            window.setTimeout(setFeatures, 2000);
            return;
        }

        console.log("Set required features:");
        console.log(JSON.stringify(info));
    });
}


// Start here
overwolf.games.onGameInfoUpdated.addListener(function (res) {
    if (gameLaunched(res)) {
        registerEvents();
        setTimeout(setFeatures, 1000);
    }
    console.log("onGameInfoUpdated: " + JSON.stringify(res));
});

overwolf.games.getRunningGameInfo(function (res) {
    if (gameRunning(res)) {
        registerEvents();
        setTimeout(setFeatures, 1000);
    }
    console.log("getRunningGameInfo: " + JSON.stringify(res));
});

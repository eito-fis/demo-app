
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


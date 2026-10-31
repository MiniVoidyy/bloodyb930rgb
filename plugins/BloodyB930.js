// ============================================================================
//  Bloody B930 "Light Strike" RGB Keyboard - SignalRGB Device Plugin
// ----------------------------------------------------------------------------
//  VID 0x09DA / PID 0xFA44
//
//  Protocol (reverse-engineered, see Bloody.NET by GeorgeGhost):
//    * All RGB traffic is sent as 64-byte HID FEATURE reports (Report ID 0x07)
//      via device.send_report() (SET_REPORT) / device.get_report().
//    * Every frame starts with the "bulk write begin" packet:
//          07 03 06 01 | 00 ... 00
//    * Then 6 color packets, each with header 07 03 06 xx:
//          xx = 07,08  -> RED   for key id < 57 and key id >= 57
//          xx = 09,0A  -> GREEN for key id < 57 and key id >= 57
//          xx = 0B,0C  -> BLUE  for key id < 57 and key id >= 57
//    * Bytes [4..5] of each color packet are always empty, so key data starts
//      at offset 6. Each packet carries 58 bytes (58 keys per half).
//    * Colour byte offset for a key with id K:
//          RED[K],  GREEN[K + 116],  BLUE[K + 232]
//
//  The HID control collection answers on usage page 0xFF52. If your unit
//  enumerates on a different page, swap the line in Validate() below.
// ============================================================================

export function Name() { return "Bloody B930 Light Strike RGB"; }
export function Publisher() { return "B930 Community Mod"; }

export function VendorId() { return 0x09DA; }
export function ProductId() { return 0xFA44; }

export function Type() { return "Hid"; }
export function DeviceType() { return "keyboard"; }

/* global
Brightness:readonly
LightingMode:readonly
forcedColor:readonly
shutdownColor:readonly
EnableSideBars:readonly
*/

export function Size() { return [20, 7]; }
export function DefaultPosition() { return [0, 0]; }
export function DefaultScale() { return 4.0; }

// ---------------------------------------------------------------------------
//  Key layout
//
//  vKeyIds / vLedNames / vLedPositions are parallel arrays.
//  vKeyIds holds the keyboard's internal key-id (byte index) for every LED,
//  so gap ids that do not exist physically are simply skipped.
// ---------------------------------------------------------------------------

var vKeyIds = [
    // Row 0 - function row
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    // Row 1 - number row / edit cluster
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    // Row 2 - qwerty row / edit cluster
    37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
    // Row 3 - home row
    58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
    // Row 4 - bottom letter row / arrows
    74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
    // Row 5 - space bar row / arrows
    91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
    // Side light bars
    104, 105
];

var vLedNames = [
    // Row 0 - function row
    "Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
    "Print Screen", "Scroll Lock", "Pause Break",
    // Row 1 - number row / edit cluster
    "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace",
    "Insert", "Home", "Page Up",
    // Row 2 - qwerty row / edit cluster
    "Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\",
    "Del", "End", "Page Down",
    // Row 3 - home row
    "Caps Lock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter",
    // Row 4 - bottom letter row / arrows
    "Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
    // Row 5 - space bar row / arrows
    "Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Apps", "Right Ctrl",
    "Left Arrow", "Down Arrow", "Right Arrow",
    // Side light bars
    "Left Bar", "Right Bar"
];

var vLedPositions = [
    // Row 0 - function row
    [0, 0], [2, 0], [3, 0], [4, 0], [5, 0], [7, 0], [8, 0], [9, 0], [10, 0],
    [12, 0], [13, 0], [14, 0], [15, 0], [17, 0], [18, 0], [19, 0],
    // Row 1 - number row / edit cluster
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1],
    [10, 1], [11, 1], [12, 1], [13, 1], [17, 1], [18, 1], [19, 1],
    // Row 2 - qwerty row / edit cluster
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2],
    [10, 2], [11, 2], [12, 2], [13, 2], [17, 2], [18, 2], [19, 2],
    // Row 3 - home row
    [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
    [10, 3], [11, 3], [12, 3],
    // Row 4 - bottom letter row / arrows
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4],
    [10, 4], [11, 4], [18, 4],
    // Row 5 - space bar row / arrows
    [0, 5], [1, 5], [2, 5], [6, 5], [10, 5], [11, 5], [12, 5], [13, 5],
    [17, 5], [18, 5], [19, 5],
    // Side light bars (below the board)
    [0, 6], [19, 6]
];

export function LedNames() { return vLedNames; }
export function LedPositions() { return vLedPositions; }

// ---------------------------------------------------------------------------
//  User controls
// ---------------------------------------------------------------------------

export function ControllableParameters() {
    return [
        { "property": "LightingMode", "group": "lighting", "label": "Lighting Mode",
          "type": "combobox", "values": ["Canvas", "Forced"], "default": "Canvas" },
        { "property": "forcedColor", "group": "lighting", "label": "Forced Color",
          "min": "0", "max": "360", "type": "color", "default": "#00b3ff" },
        { "property": "Brightness", "group": "lighting", "label": "Brightness (%)",
          "step": "5", "type": "number", "min": "0", "max": "100", "default": "100" },
        { "property": "shutdownColor", "group": "lighting", "label": "Shutdown Color",
          "min": "0", "max": "360", "type": "color", "default": "#000000" },
        { "property": "EnableSideBars", "group": "lighting", "label": "Enable Side Bars",
          "type": "boolean", "default": "true" }
    ];
}

// ---------------------------------------------------------------------------
//  Endpoint selection
//
//  The B930 RGB control collection uses HID Feature reports (SetFeature /
//  GetFeature) and enumerates with the vendor usage page 0xFF52.
//  If your board reports a different page, try one of the alternatives below.
// ---------------------------------------------------------------------------

export function Validate(endpoint) {
    return endpoint.usage_page === 0xff52;
    // return endpoint.usage_page === 0xff00;                       // alternative A
    // return endpoint.usage_page === 0x000c && endpoint.usage === 0x0001; // alternative B
}

export function ImageUrl() { return "https://www.bloody.pl/wp-content/uploads/2018/02/b930.jpg"; }

// ---------------------------------------------------------------------------
//  Packet helpers
// ---------------------------------------------------------------------------

// The B930 firmware cannot keep up with back-to-back feature reports: sending
// the whole frame as fast as possible makes it drop most packets and only a
// few keys light up. A small gap between packets (or a GetFeature handshake)
// lets every packet land. 2 ms is the proven minimum and keeps the frame
// budget low (7 packets * 2 ms = ~14 ms per frame).
var PACKET_GAP_MS = 0;

function MakePacket(bytes) {
    var packet = new Array(64).fill(0);
    for (var j = 0; j < bytes.length; j++) packet[j] = bytes[j];
    return packet;
}

function SendCtrl(bytes) {
    SendCtrlRaw(MakePacket(bytes));
}

var _scratch348 = new Array(348).fill(0);
var _lastInitDone = false;
var _sendErrLogged = false;
var _sfStart = 0;
var _sfCount = 0;
var _sfChanged = 0;
var _sfPattern = "";
var _sfLast = 0;
var _sfMaxGap = 0;
var _sfMinGap = 999999;
var _sfGapSum = 0;
var _sfN = 0;

function SendCtrlRaw(packet) {
    try {
        device.send_report(packet, 64);
    } catch (e) {
        if (!_sendErrLogged) {
            _sendErrLogged = true;
            device.log("B930 SEND ERR: " + e, { toFile: true });
        }
    }
    device.pause(PACKET_GAP_MS);
}

function GetCtrl() {
    try {
        device.get_report([0x07], 64);
    } catch (e) {
        device.log("B930 GET ERR: " + e, { toFile: true });
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}

// Scale a colour by the user's Brightness setting (0-200%, default 100%).
// Values above 100% brighten colours that are not already saturated; the
// result is clamped to 255 so pure colours simply stay at full.
function applyBrightness(col) {
    var pct = Number(Brightness);
    if (isNaN(pct)) pct = 100;
    pct = Math.max(0, Math.min(100, pct)) / 100;
    return [
        Math.min(255, Math.round(col[0] * pct)),
        Math.min(255, Math.round(col[1] * pct)),
        Math.min(255, Math.round(col[2] * pct))
    ];
}

// ---------------------------------------------------------------------------
//  Initialization sequence
//
//  SetFeature / GetFeature handshake captured from the stock firmware while
//  entering software-control mode. Mirrors the working Bloody.NET sequence.
// ---------------------------------------------------------------------------

function DoInitSequence() {
    var pings = [0x1f, 0x1f, 0x05, 0x1f, 0x1f, 0x1f, 0x29, 0x1f, 0x1f, 0x1f,
                 0x05, 0x07, 0x1f, 0x1f, 0x2a, 0x1f, 0x1f, 0x2a, 0x1f, 0x1f, 0x29];
    for (var i = 0; i < pings.length; i++) SendCtrl([0x07, pings[i]]);
    SendCtrl([0x07, 0x1e, 0x01]);
    SendCtrl([0x07, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
    SendCtrl([0x07, 0x05]);
    SendCtrl([0x07, 0x2f, 0x00, 0x2e]);
    SendCtrl([0x07, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x80]);
    SendCtrl([0x07, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x80]);
    SendCtrl([0x07, 0x03, 0x06, 0x05]);
    SendCtrl([0x07, 0x06]);
    SendCtrl([0x07, 0x03, 0x06, 0x01]);
    SendCtrl([0x07, 0x03, 0x06, 0x01]);
    SendCtrl([0x07, 0x03, 0x06, 0x05]);
    SendCtrl([0x07, 0x03, 0x06, 0x01]);
    SendCtrl([0x07, 0x03, 0x06, 0x01]);
}

// ---------------------------------------------------------------------------
//  Render
// ---------------------------------------------------------------------------

export function Initialize() {
    device.log("B930 GLOBAL-BRIGHTNESS=" + device.getBrightness(), { toFile: true });
    try {
        try { device.set_endpoint(2, 0x0244, 0xff52, 0x0004); } catch (e2) {
            device.log("B930 SET-ENDPOINT ERR: " + e2, { toFile: true });
        }
        try { device.setFrameRateTarget(60); } catch (e3) {
            device.log("B930 SET-FPS ERR: " + e3, { toFile: true });
        }
        DoInitSequence();
        device.log("B930 INIT COMPLETE", { toFile: true });
        _lastInitDone = true;
    } catch (e) {
        device.log("B930 INIT ERROR: " + e, { toFile: true });
    }
}

var _rfCount = 0;
var _rfStart = 0;
export function Render() {
    if (_rfStart === 0) _rfStart = Date.now();
    _rfCount++;
    if (_rfCount % 120 === 0) {
        var el = Date.now() - _rfStart;
        device.log("B930 RENDER=" + (_rfCount / (el / 1000)).toFixed(1) +
                   "fps SENDcount=" + _sfCount + " changed=" + _sfChanged, { toFile: true });
        device.log("B930 PATTERN " + _sfPattern, { toFile: true });
        _sfCount = 0;
        _sfChanged = 0;
        _sfPattern = "";
    }
    // Defer the HID sends to a microtask so they don't block SignalRGB's
    // render callback. Sending synchronously here adds ~12ms to every frame
    // (the engine sleeps *after* Render returns), capping us at ~36fps.
    if (typeof Promise === "function") {
        Promise.resolve().then(function () { SendFrame(false, null); });
    } else {
        SendFrame(false, null);
    }
}

export function Shutdown(SystemSuspending) {
    if (SystemSuspending) {
        SendFrame(true, [0, 0, 0]);
    } else {
        SendFrame(true, hexToRgb(shutdownColor));
    }
}

function SendFrame(useOverride, overrideColor) {
    _sfCount++;
    var _now = Date.now();
    if (_sfLast > 0) {
        var g = _now - _sfLast;
        if (g > _sfMaxGap) _sfMaxGap = g;
        if (g < _sfMinGap) _sfMinGap = g;
        _sfGapSum += g; _sfN++;
    }
    _sfLast = _now;
    // keyColors layout:  [0..115] = RED for key ids 0..115
    //                    [116..231] = GREEN
    //                    [232..347] = BLUE
    var arr = _scratch348;
    var keyColors = arr;
    var changed = false;

    for (var i = 0; i < vLedPositions.length; i++) {
        var col;
        if (useOverride) {
            col = overrideColor;
        } else if (LightingMode === "Forced") {
            col = hexToRgb(forcedColor);
        } else {
            col = device.color(vLedPositions[i][0], vLedPositions[i][1]);
        }

        col = applyBrightness(col);

        var kid = vKeyIds[i];
        var kc0 = col[0], kc1 = col[1], kc2 = col[2];
        if (arr[kid] !== kc0 || arr[kid + 116] !== kc1 || arr[kid + 232] !== kc2) changed = true;
        arr[kid] = kc0;         // RED   -> firmware packets 07/08
        arr[kid + 116] = kc1;   // GREEN -> firmware packets 09/0a
        arr[kid + 232] = kc2;   // BLUE  -> firmware packets 0b/0c
    }
    if (changed) _sfChanged++;
    _sfPattern += (changed ? "1" : "0");

    if (!EnableSideBars) {
        var b0 = arr[104] !== 0, b1 = arr[105] !== 0,
            g0 = arr[220] !== 0, g1 = arr[221] !== 0,
            bl0 = arr[336] !== 0, bl1 = arr[337] !== 0;
        if (b0 || b1 || g0 || g1 || bl0 || bl1) changed = true;
        arr[104] = 0; arr[220] = 0; arr[336] = 0;
        arr[105] = 0; arr[221] = 0; arr[337] = 0;
    }

    if (!_lastInitDone) return;

    // Six color packets: 07 03 06 07 .. 07 03 06 0C
    //   p = 1,2 -> R  (keys 0..57, 58..115)
    //   p = 3,4 -> G  (keys 0..57, 58..115)
    //   p = 5,6 -> B  (keys 0..57, 58..115)
    // The "bulk write begin" packet (07 03 06 01) is sent once during init,
    // matching the reference implementation, so frames stay at 6 transfers.
    for (var p = 1; p <= 6; p++) {
        var packet = MakePacket([0x07, 0x03, 0x06, 0x06 + p]);
        var base = (p * 58) - 58;
        for (var b = 0; b < 58; b++) {
            packet[6 + b] = keyColors[base + b];
        }
        SendCtrlRaw(packet);
    }
}
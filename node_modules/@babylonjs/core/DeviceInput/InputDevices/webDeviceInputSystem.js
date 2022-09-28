import { DomManagement } from "../../Misc/domManagement.js";
import { Tools } from "../../Misc/tools.js";
import { DeviceEventFactory } from "../Helpers/eventFactory.js";
import { DeviceType, PointerInput } from "./deviceEnums.js";
// eslint-disable-next-line @typescript-eslint/naming-convention
var MAX_KEYCODES = 255;
// eslint-disable-next-line @typescript-eslint/naming-convention
var MAX_POINTER_INPUTS = Object.keys(PointerInput).length / 2;
/** @hidden */
var WebDeviceInputSystem = /** @class */ (function () {
    function WebDeviceInputSystem(engine, onDeviceConnected, onDeviceDisconnected, onInputChanged) {
        var _this = this;
        // Private Members
        this._inputs = [];
        this._keyboardActive = false;
        this._pointerActive = false;
        this._usingSafari = Tools.IsSafari();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._keyboardDownEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._keyboardUpEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._keyboardBlurEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerMoveEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerDownEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerUpEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerCancelEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerWheelEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._pointerBlurEvent = function (evt) { };
        this._eventsAttached = false;
        this._mouseId = -1;
        this._isUsingFirefox = DomManagement.IsNavigatorAvailable() && navigator.userAgent && navigator.userAgent.indexOf("Firefox") !== -1;
        this._maxTouchPoints = 0;
        this._pointerInputClearObserver = null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._gamepadConnectedEvent = function (evt) { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._gamepadDisconnectedEvent = function (evt) { };
        this._eventPrefix = Tools.GetPointerPrefix(engine);
        this._engine = engine;
        this._onDeviceConnected = onDeviceConnected;
        this._onDeviceDisconnected = onDeviceDisconnected;
        this._onInputChanged = onInputChanged;
        this._enableEvents();
        // Set callback to enable event handler switching when inputElement changes
        if (!this._engine._onEngineViewChanged) {
            this._engine._onEngineViewChanged = function () {
                _this._enableEvents();
            };
        }
    }
    // Public functions
    /**
     * Checks for current device input value, given an id and input index. Throws exception if requested device not initialized.
     * @param deviceType Enum specifying device type
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @returns Current value of input
     */
    WebDeviceInputSystem.prototype.pollInput = function (deviceType, deviceSlot, inputIndex) {
        var device = this._inputs[deviceType][deviceSlot];
        if (!device) {
            throw "Unable to find device ".concat(DeviceType[deviceType]);
        }
        if (deviceType >= DeviceType.DualShock && deviceType <= DeviceType.DualSense && navigator.getGamepads) {
            this._updateDevice(deviceType, deviceSlot, inputIndex);
        }
        var currentValue = device[inputIndex];
        if (currentValue === undefined) {
            throw "Unable to find input ".concat(inputIndex, " for device ").concat(DeviceType[deviceType], " in slot ").concat(deviceSlot);
        }
        if (inputIndex === PointerInput.Move) {
            Tools.Warn("Unable to provide information for PointerInput.Move.  Try using PointerInput.Horizontal or PointerInput.Vertical for move data.");
        }
        return currentValue;
    };
    /**
     * Check for a specific device in the DeviceInputSystem
     * @param deviceType Type of device to check for
     * @returns bool with status of device's existence
     */
    WebDeviceInputSystem.prototype.isDeviceAvailable = function (deviceType) {
        return this._inputs[deviceType] !== undefined;
    };
    /**
     * Dispose of all the eventlisteners
     */
    WebDeviceInputSystem.prototype.dispose = function () {
        // Callbacks
        this._onDeviceConnected = function () { };
        this._onDeviceDisconnected = function () { };
        this._onInputChanged = function () { };
        delete this._engine._onEngineViewChanged;
        if (this._elementToAttachTo) {
            this._disableEvents();
        }
    };
    /**
     * Enable listening for user input events
     */
    WebDeviceInputSystem.prototype._enableEvents = function () {
        var inputElement = this === null || this === void 0 ? void 0 : this._engine.getInputElement();
        if (inputElement && (!this._eventsAttached || this._elementToAttachTo !== inputElement)) {
            // Remove events before adding to avoid double events or simultaneous events on multiple canvases
            this._disableEvents();
            // If the inputs array has already been created, zero it out to before setting up events
            if (this._inputs) {
                for (var _i = 0, _a = this._inputs; _i < _a.length; _i++) {
                    var inputs = _a[_i];
                    if (inputs) {
                        for (var deviceSlotKey in inputs) {
                            var deviceSlot = +deviceSlotKey;
                            var device = inputs[deviceSlot];
                            if (device) {
                                for (var inputIndex = 0; inputIndex < device.length; inputIndex++) {
                                    device[inputIndex] = 0;
                                }
                            }
                        }
                    }
                }
            }
            this._elementToAttachTo = inputElement;
            // Set tab index for the inputElement to the engine's canvasTabIndex, if and only if the element's tab index is -1
            this._elementToAttachTo.tabIndex = this._elementToAttachTo.tabIndex !== -1 ? this._elementToAttachTo.tabIndex : this._engine.canvasTabIndex;
            this._handleKeyActions();
            this._handlePointerActions();
            this._handleGamepadActions();
            this._eventsAttached = true;
            // Check for devices that are already connected but aren't registered. Currently, only checks for gamepads and mouse
            this._checkForConnectedDevices();
        }
    };
    /**
     * Disable listening for user input events
     */
    WebDeviceInputSystem.prototype._disableEvents = function () {
        if (this._elementToAttachTo) {
            // Blur Events
            this._elementToAttachTo.removeEventListener("blur", this._keyboardBlurEvent);
            this._elementToAttachTo.removeEventListener("blur", this._pointerBlurEvent);
            // Keyboard Events
            this._elementToAttachTo.removeEventListener("keydown", this._keyboardDownEvent);
            this._elementToAttachTo.removeEventListener("keyup", this._keyboardUpEvent);
            // Pointer Events
            this._elementToAttachTo.removeEventListener(this._eventPrefix + "move", this._pointerMoveEvent);
            this._elementToAttachTo.removeEventListener(this._eventPrefix + "down", this._pointerDownEvent);
            this._elementToAttachTo.removeEventListener(this._eventPrefix + "up", this._pointerUpEvent);
            this._elementToAttachTo.removeEventListener(this._eventPrefix + "cancel", this._pointerCancelEvent);
            this._elementToAttachTo.removeEventListener(this._wheelEventName, this._pointerWheelEvent);
            // Gamepad Events
            window.removeEventListener("gamepadconnected", this._gamepadConnectedEvent);
            window.removeEventListener("gamepaddisconnected", this._gamepadDisconnectedEvent);
        }
        if (this._pointerInputClearObserver) {
            this._engine.onEndFrameObservable.remove(this._pointerInputClearObserver);
        }
        this._eventsAttached = false;
    };
    /**
     * Checks for existing connections to devices and register them, if necessary
     * Currently handles gamepads and mouse
     */
    WebDeviceInputSystem.prototype._checkForConnectedDevices = function () {
        if (navigator.getGamepads) {
            var gamepads = navigator.getGamepads();
            for (var _i = 0, gamepads_1 = gamepads; _i < gamepads_1.length; _i++) {
                var gamepad = gamepads_1[_i];
                if (gamepad) {
                    this._addGamePad(gamepad);
                }
            }
        }
        // If the device in use has mouse capabilities, pre-register mouse
        if (matchMedia("(pointer:fine)").matches) {
            // This will provide a dummy value for the cursor position and is expected to be overridden when the first mouse event happens.
            // There isn't any good way to get the current position outside of a pointer event so that's why this was done.
            this._addPointerDevice(DeviceType.Mouse, 0, 0, 0);
        }
    };
    // Private functions
    /**
     * Add a gamepad to the DeviceInputSystem
     * @param gamepad A single DOM Gamepad object
     */
    WebDeviceInputSystem.prototype._addGamePad = function (gamepad) {
        var deviceType = this._getGamepadDeviceType(gamepad.id);
        var deviceSlot = gamepad.index;
        this._gamepads = this._gamepads || new Array(gamepad.index + 1);
        this._registerDevice(deviceType, deviceSlot, gamepad.buttons.length + gamepad.axes.length);
        this._gamepads[deviceSlot] = deviceType;
    };
    /**
     * Add pointer device to DeviceInputSystem
     * @param deviceType Type of Pointer to add
     * @param deviceSlot Pointer ID (0 for mouse, pointerId for Touch)
     * @param currentX Current X at point of adding
     * @param currentY Current Y at point of adding
     */
    WebDeviceInputSystem.prototype._addPointerDevice = function (deviceType, deviceSlot, currentX, currentY) {
        if (!this._pointerActive) {
            this._pointerActive = true;
        }
        this._registerDevice(deviceType, deviceSlot, MAX_POINTER_INPUTS);
        var pointer = this._inputs[deviceType][deviceSlot]; /* initialize our pointer position immediately after registration */
        pointer[0] = currentX;
        pointer[1] = currentY;
    };
    /**
     * Add device and inputs to device array
     * @param deviceType Enum specifying device type
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param numberOfInputs Number of input entries to create for given device
     */
    WebDeviceInputSystem.prototype._registerDevice = function (deviceType, deviceSlot, numberOfInputs) {
        if (deviceSlot === undefined) {
            throw "Unable to register device ".concat(DeviceType[deviceType], " to undefined slot.");
        }
        if (!this._inputs[deviceType]) {
            this._inputs[deviceType] = {};
        }
        if (!this._inputs[deviceType][deviceSlot]) {
            var device = new Array(numberOfInputs);
            for (var i = 0; i < numberOfInputs; i++) {
                device[i] = 0; /* set device input as unpressed */
            }
            this._inputs[deviceType][deviceSlot] = device;
            this._onDeviceConnected(deviceType, deviceSlot);
        }
    };
    /**
     * Given a specific device name, remove that device from the device map
     * @param deviceType Enum specifying device type
     * @param deviceSlot "Slot" or index that device is referenced in
     */
    WebDeviceInputSystem.prototype._unregisterDevice = function (deviceType, deviceSlot) {
        if (this._inputs[deviceType][deviceSlot]) {
            delete this._inputs[deviceType][deviceSlot];
            this._onDeviceDisconnected(deviceType, deviceSlot);
        }
    };
    /**
     * Handle all actions that come from keyboard interaction
     */
    WebDeviceInputSystem.prototype._handleKeyActions = function () {
        var _this = this;
        this._keyboardDownEvent = function (evt) {
            if (!_this._keyboardActive) {
                _this._keyboardActive = true;
                _this._registerDevice(DeviceType.Keyboard, 0, MAX_KEYCODES);
            }
            var kbKey = _this._inputs[DeviceType.Keyboard][0];
            if (kbKey) {
                kbKey[evt.keyCode] = 1;
                var deviceEvent = evt;
                deviceEvent.inputIndex = evt.keyCode;
                _this._onInputChanged(DeviceType.Keyboard, 0, deviceEvent);
            }
        };
        this._keyboardUpEvent = function (evt) {
            if (!_this._keyboardActive) {
                _this._keyboardActive = true;
                _this._registerDevice(DeviceType.Keyboard, 0, MAX_KEYCODES);
            }
            var kbKey = _this._inputs[DeviceType.Keyboard][0];
            if (kbKey) {
                kbKey[evt.keyCode] = 0;
                var deviceEvent = evt;
                deviceEvent.inputIndex = evt.keyCode;
                _this._onInputChanged(DeviceType.Keyboard, 0, deviceEvent);
            }
        };
        this._keyboardBlurEvent = function () {
            if (_this._keyboardActive) {
                var kbKey = _this._inputs[DeviceType.Keyboard][0];
                for (var i = 0; i < kbKey.length; i++) {
                    if (kbKey[i] !== 0) {
                        kbKey[i] = 0;
                        var deviceEvent = DeviceEventFactory.CreateDeviceEvent(DeviceType.Keyboard, 0, i, 0, _this, _this._elementToAttachTo);
                        _this._onInputChanged(DeviceType.Keyboard, 0, deviceEvent);
                    }
                }
            }
        };
        this._elementToAttachTo.addEventListener("keydown", this._keyboardDownEvent);
        this._elementToAttachTo.addEventListener("keyup", this._keyboardUpEvent);
        this._elementToAttachTo.addEventListener("blur", this._keyboardBlurEvent);
    };
    /**
     * Handle all actions that come from pointer interaction
     */
    WebDeviceInputSystem.prototype._handlePointerActions = function () {
        var _this = this;
        // If maxTouchPoints is defined, use that value.  Otherwise, allow for a minimum for supported gestures like pinch
        this._maxTouchPoints = (DomManagement.IsNavigatorAvailable() && navigator.maxTouchPoints) || 2;
        if (!this._activeTouchIds) {
            this._activeTouchIds = new Array(this._maxTouchPoints);
        }
        for (var i = 0; i < this._maxTouchPoints; i++) {
            this._activeTouchIds[i] = -1;
        }
        this._pointerMoveEvent = function (evt) {
            var deviceType = _this._getPointerType(evt);
            var deviceSlot = deviceType === DeviceType.Mouse ? 0 : _this._activeTouchIds.indexOf(evt.pointerId);
            if (!_this._inputs[deviceType]) {
                _this._inputs[deviceType] = {};
            }
            if (!_this._inputs[deviceType][deviceSlot]) {
                _this._addPointerDevice(deviceType, deviceSlot, evt.clientX, evt.clientY);
            }
            var pointer = _this._inputs[deviceType][deviceSlot];
            if (pointer) {
                pointer[PointerInput.Horizontal] = evt.clientX;
                pointer[PointerInput.Vertical] = evt.clientY;
                var deviceEvent = evt;
                deviceEvent.inputIndex = PointerInput.Move;
                _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                // Lets Propagate the event for move with same position.
                if (!_this._usingSafari && evt.button !== -1) {
                    deviceEvent.inputIndex = evt.button + 2;
                    pointer[evt.button + 2] = pointer[evt.button + 2] ? 0 : 1; // Reverse state of button if evt.button has value
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
            }
        };
        this._pointerDownEvent = function (evt) {
            var deviceType = _this._getPointerType(evt);
            var deviceSlot = deviceType === DeviceType.Mouse ? 0 : evt.pointerId;
            if (deviceType === DeviceType.Touch) {
                var idx = _this._activeTouchIds.indexOf(-1);
                if (idx >= 0) {
                    deviceSlot = idx;
                    _this._activeTouchIds[idx] = evt.pointerId;
                }
                else {
                    // We can't find an open slot to store new pointer so just return (can only support max number of touches)
                    Tools.Warn("Max number of touches exceeded.  Ignoring touches in excess of ".concat(_this._maxTouchPoints));
                    return;
                }
            }
            if (!_this._inputs[deviceType]) {
                _this._inputs[deviceType] = {};
            }
            if (!_this._inputs[deviceType][deviceSlot]) {
                _this._addPointerDevice(deviceType, deviceSlot, evt.clientX, evt.clientY);
            }
            else if (deviceType === DeviceType.Touch) {
                _this._onDeviceConnected(deviceType, deviceSlot);
            }
            var pointer = _this._inputs[deviceType][deviceSlot];
            if (pointer) {
                var previousHorizontal = pointer[PointerInput.Horizontal];
                var previousVertical = pointer[PointerInput.Vertical];
                if (deviceType === DeviceType.Mouse) {
                    // Mouse; Among supported browsers, value is either 1 or 0 for mouse
                    if (_this._mouseId === -1) {
                        if (evt.pointerId === undefined) {
                            // If there is no pointerId (eg. manually dispatched MouseEvent)
                            _this._mouseId = _this._isUsingFirefox ? 0 : 1;
                        }
                        else {
                            _this._mouseId = evt.pointerId;
                        }
                    }
                    if (!document.pointerLockElement && _this._elementToAttachTo.hasPointerCapture) {
                        try {
                            _this._elementToAttachTo.setPointerCapture(_this._mouseId);
                        }
                        catch (e) {
                            // DO NOTHING
                        }
                    }
                }
                else {
                    // Touch; Since touches are dynamically assigned, only set capture if we have an id
                    if (evt.pointerId && !document.pointerLockElement && _this._elementToAttachTo.hasPointerCapture) {
                        try {
                            _this._elementToAttachTo.setPointerCapture(evt.pointerId);
                        }
                        catch (e) {
                            // DO NOTHING
                        }
                    }
                }
                pointer[PointerInput.Horizontal] = evt.clientX;
                pointer[PointerInput.Vertical] = evt.clientY;
                pointer[evt.button + 2] = 1;
                var deviceEvent = evt;
                // NOTE: The +2 used here to is because PointerInput has the same value progression for its mouse buttons as PointerEvent.button
                // However, we have our X and Y values front-loaded to group together the touch inputs but not break this progression
                // EG. ([X, Y, Left-click], Middle-click, etc...)
                deviceEvent.inputIndex = evt.button + 2;
                _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                if (previousHorizontal !== evt.clientX || previousVertical !== evt.clientY) {
                    deviceEvent.inputIndex = PointerInput.Move;
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
            }
        };
        this._pointerUpEvent = function (evt) {
            var _a, _b, _c, _d, _e;
            var deviceType = _this._getPointerType(evt);
            var deviceSlot = deviceType === DeviceType.Mouse ? 0 : _this._activeTouchIds.indexOf(evt.pointerId);
            if (deviceType === DeviceType.Touch) {
                if (deviceSlot === -1) {
                    return;
                }
                else {
                    _this._activeTouchIds[deviceSlot] = -1;
                }
            }
            var pointer = (_a = _this._inputs[deviceType]) === null || _a === void 0 ? void 0 : _a[deviceSlot];
            if (pointer && pointer[evt.button + 2] !== 0) {
                var previousHorizontal = pointer[PointerInput.Horizontal];
                var previousVertical = pointer[PointerInput.Vertical];
                pointer[PointerInput.Horizontal] = evt.clientX;
                pointer[PointerInput.Vertical] = evt.clientY;
                pointer[evt.button + 2] = 0;
                var deviceEvent = evt;
                if (previousHorizontal !== evt.clientX || previousVertical !== evt.clientY) {
                    deviceEvent.inputIndex = PointerInput.Move;
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
                // NOTE: The +2 used here to is because PointerInput has the same value progression for its mouse buttons as PointerEvent.button
                // However, we have our X and Y values front-loaded to group together the touch inputs but not break this progression
                // EG. ([X, Y, Left-click], Middle-click, etc...)
                deviceEvent.inputIndex = evt.button + 2;
                if (deviceType === DeviceType.Mouse && _this._mouseId >= 0 && ((_c = (_b = _this._elementToAttachTo).hasPointerCapture) === null || _c === void 0 ? void 0 : _c.call(_b, _this._mouseId))) {
                    _this._elementToAttachTo.releasePointerCapture(_this._mouseId);
                }
                else if (evt.pointerId && ((_e = (_d = _this._elementToAttachTo).hasPointerCapture) === null || _e === void 0 ? void 0 : _e.call(_d, evt.pointerId))) {
                    _this._elementToAttachTo.releasePointerCapture(evt.pointerId);
                }
                _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                if (deviceType === DeviceType.Touch) {
                    _this._onDeviceDisconnected(deviceType, deviceSlot);
                }
            }
        };
        this._pointerCancelEvent = function (evt) {
            var _a, _b, _c, _d;
            if (evt.pointerType === "mouse") {
                var pointer = _this._inputs[DeviceType.Mouse][0];
                if (_this._mouseId >= 0 && ((_b = (_a = _this._elementToAttachTo).hasPointerCapture) === null || _b === void 0 ? void 0 : _b.call(_a, _this._mouseId))) {
                    _this._elementToAttachTo.releasePointerCapture(_this._mouseId);
                }
                for (var inputIndex = PointerInput.LeftClick; inputIndex <= PointerInput.BrowserForward; inputIndex++) {
                    if (pointer[inputIndex] === 1) {
                        pointer[inputIndex] = 0;
                        var deviceEvent = DeviceEventFactory.CreateDeviceEvent(DeviceType.Mouse, 0, inputIndex, 0, _this, _this._elementToAttachTo);
                        _this._onInputChanged(DeviceType.Mouse, 0, deviceEvent);
                    }
                }
            }
            else {
                var deviceSlot = _this._activeTouchIds.indexOf(evt.pointerId);
                if ((_d = (_c = _this._elementToAttachTo).hasPointerCapture) === null || _d === void 0 ? void 0 : _d.call(_c, evt.pointerId)) {
                    _this._elementToAttachTo.releasePointerCapture(evt.pointerId);
                }
                _this._inputs[DeviceType.Touch][deviceSlot][PointerInput.LeftClick] = 0;
                var deviceEvent = DeviceEventFactory.CreateDeviceEvent(DeviceType.Touch, deviceSlot, PointerInput.LeftClick, 0, _this, _this._elementToAttachTo);
                _this._onInputChanged(DeviceType.Touch, deviceSlot, deviceEvent);
                _this._activeTouchIds[deviceSlot] = -1;
                _this._onDeviceDisconnected(DeviceType.Touch, deviceSlot);
            }
        };
        // Set Wheel Event Name, code originally from scene.inputManager
        this._wheelEventName =
            "onwheel" in document.createElement("div")
                ? "wheel" // Modern browsers support "wheel"
                : document.onmousewheel !== undefined
                    ? "mousewheel" // Webkit and IE support at least "mousewheel"
                    : "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
        // Code originally in scene.inputManager.ts
        // Chrome reports warning in console if wheel listener doesn't set an explicit passive option.
        // IE11 only supports captureEvent:boolean, not options:object, and it defaults to false.
        // Feature detection technique copied from: https://github.com/github/eventlistener-polyfill (MIT license)
        var passiveSupported = false;
        var noop = function () { };
        try {
            var options = {
                passive: {
                    get: function () {
                        passiveSupported = true;
                    },
                },
            };
            this._elementToAttachTo.addEventListener("test", noop, options);
            this._elementToAttachTo.removeEventListener("test", noop, options);
        }
        catch (e) {
            /* */
        }
        this._pointerBlurEvent = function () {
            var _a, _b, _c, _d, _e;
            // Handle mouse buttons
            if (_this.isDeviceAvailable(DeviceType.Mouse)) {
                var pointer = _this._inputs[DeviceType.Mouse][0];
                if (_this._mouseId >= 0 && ((_b = (_a = _this._elementToAttachTo).hasPointerCapture) === null || _b === void 0 ? void 0 : _b.call(_a, _this._mouseId))) {
                    _this._elementToAttachTo.releasePointerCapture(_this._mouseId);
                }
                for (var inputIndex = PointerInput.LeftClick; inputIndex <= PointerInput.BrowserForward; inputIndex++) {
                    if (pointer[inputIndex] === 1) {
                        pointer[inputIndex] = 0;
                        var deviceEvent = DeviceEventFactory.CreateDeviceEvent(DeviceType.Mouse, 0, inputIndex, 0, _this, _this._elementToAttachTo);
                        _this._onInputChanged(DeviceType.Mouse, 0, deviceEvent);
                    }
                }
            }
            // Handle Active Touches
            if (_this.isDeviceAvailable(DeviceType.Touch)) {
                var pointer = _this._inputs[DeviceType.Touch];
                for (var deviceSlot = 0; deviceSlot < _this._activeTouchIds.length; deviceSlot++) {
                    var pointerId = _this._activeTouchIds[deviceSlot];
                    if ((_d = (_c = _this._elementToAttachTo).hasPointerCapture) === null || _d === void 0 ? void 0 : _d.call(_c, pointerId)) {
                        _this._elementToAttachTo.releasePointerCapture(pointerId);
                    }
                    if (pointerId !== -1 && ((_e = pointer[deviceSlot]) === null || _e === void 0 ? void 0 : _e[PointerInput.LeftClick]) === 1) {
                        pointer[deviceSlot][PointerInput.LeftClick] = 0;
                        var deviceEvent = DeviceEventFactory.CreateDeviceEvent(DeviceType.Touch, deviceSlot, PointerInput.LeftClick, 0, _this, _this._elementToAttachTo);
                        _this._onInputChanged(DeviceType.Touch, deviceSlot, deviceEvent);
                        _this._activeTouchIds[deviceSlot] = -1;
                        _this._onDeviceDisconnected(DeviceType.Touch, deviceSlot);
                    }
                }
            }
        };
        this._pointerWheelEvent = function (evt) {
            var deviceType = DeviceType.Mouse;
            var deviceSlot = 0;
            if (!_this._inputs[deviceType]) {
                _this._inputs[deviceType] = [];
            }
            if (!_this._inputs[deviceType][deviceSlot]) {
                _this._pointerActive = true;
                _this._registerDevice(deviceType, deviceSlot, MAX_POINTER_INPUTS);
            }
            var pointer = _this._inputs[deviceType][deviceSlot];
            if (pointer) {
                pointer[PointerInput.MouseWheelX] = evt.deltaX || 0;
                pointer[PointerInput.MouseWheelY] = evt.deltaY || evt.wheelDelta || 0;
                pointer[PointerInput.MouseWheelZ] = evt.deltaZ || 0;
                var deviceEvent = evt;
                if (pointer[PointerInput.MouseWheelX] !== 0) {
                    deviceEvent.inputIndex = PointerInput.MouseWheelX;
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
                if (pointer[PointerInput.MouseWheelY] !== 0) {
                    deviceEvent.inputIndex = PointerInput.MouseWheelY;
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
                if (pointer[PointerInput.MouseWheelZ] !== 0) {
                    deviceEvent.inputIndex = PointerInput.MouseWheelZ;
                    _this._onInputChanged(deviceType, deviceSlot, deviceEvent);
                }
            }
        };
        this._elementToAttachTo.addEventListener(this._eventPrefix + "move", this._pointerMoveEvent);
        this._elementToAttachTo.addEventListener(this._eventPrefix + "down", this._pointerDownEvent);
        this._elementToAttachTo.addEventListener(this._eventPrefix + "up", this._pointerUpEvent);
        this._elementToAttachTo.addEventListener(this._eventPrefix + "cancel", this._pointerCancelEvent);
        this._elementToAttachTo.addEventListener("blur", this._pointerBlurEvent);
        this._elementToAttachTo.addEventListener(this._wheelEventName, this._pointerWheelEvent, passiveSupported ? { passive: false } : false);
        // Since there's no up or down event for mouse wheel or delta x/y, clear mouse values at end of frame
        this._pointerInputClearObserver = this._engine.onEndFrameObservable.add(function () {
            if (_this.isDeviceAvailable(DeviceType.Mouse)) {
                var pointer = _this._inputs[DeviceType.Mouse][0];
                pointer[PointerInput.MouseWheelX] = 0;
                pointer[PointerInput.MouseWheelY] = 0;
                pointer[PointerInput.MouseWheelZ] = 0;
            }
        });
    };
    /**
     * Handle all actions that come from gamepad interaction
     */
    WebDeviceInputSystem.prototype._handleGamepadActions = function () {
        var _this = this;
        this._gamepadConnectedEvent = function (evt) {
            _this._addGamePad(evt.gamepad);
        };
        this._gamepadDisconnectedEvent = function (evt) {
            if (_this._gamepads) {
                var deviceType = _this._getGamepadDeviceType(evt.gamepad.id);
                var deviceSlot = evt.gamepad.index;
                _this._unregisterDevice(deviceType, deviceSlot);
                delete _this._gamepads[deviceSlot];
            }
        };
        window.addEventListener("gamepadconnected", this._gamepadConnectedEvent);
        window.addEventListener("gamepaddisconnected", this._gamepadDisconnectedEvent);
    };
    /**
     * Update all non-event based devices with each frame
     * @param deviceType Enum specifying device type
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     */
    WebDeviceInputSystem.prototype._updateDevice = function (deviceType, deviceSlot, inputIndex) {
        // Gamepads
        var gp = navigator.getGamepads()[deviceSlot];
        if (gp && deviceType === this._gamepads[deviceSlot]) {
            var device = this._inputs[deviceType][deviceSlot];
            if (inputIndex >= gp.buttons.length) {
                device[inputIndex] = gp.axes[inputIndex - gp.buttons.length].valueOf();
            }
            else {
                device[inputIndex] = gp.buttons[inputIndex].value;
            }
        }
    };
    /**
     * Gets DeviceType from the device name
     * @param deviceName Name of Device from DeviceInputSystem
     * @returns DeviceType enum value
     */
    WebDeviceInputSystem.prototype._getGamepadDeviceType = function (deviceName) {
        if (deviceName.indexOf("054c") !== -1) {
            // DualShock 4 Gamepad
            return deviceName.indexOf("0ce6") !== -1 ? DeviceType.DualSense : DeviceType.DualShock;
        }
        else if (deviceName.indexOf("Xbox One") !== -1 || deviceName.search("Xbox 360") !== -1 || deviceName.search("xinput") !== -1) {
            // Xbox Gamepad
            return DeviceType.Xbox;
        }
        else if (deviceName.indexOf("057e") !== -1) {
            // Switch Gamepad
            return DeviceType.Switch;
        }
        return DeviceType.Generic;
    };
    /**
     * Get DeviceType from a given pointer/mouse/touch event.
     * @param evt PointerEvent to evaluate
     * @returns DeviceType interpreted from event
     */
    WebDeviceInputSystem.prototype._getPointerType = function (evt) {
        var deviceType = DeviceType.Mouse;
        if (evt.pointerType === "touch" || evt.pointerType === "pen" || evt.touches) {
            deviceType = DeviceType.Touch;
        }
        return deviceType;
    };
    return WebDeviceInputSystem;
}());
export { WebDeviceInputSystem };
//# sourceMappingURL=webDeviceInputSystem.js.map
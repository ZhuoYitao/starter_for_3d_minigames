import { DeviceType } from "./deviceEnums.js";
import { NativeDeviceInputSystem } from "./nativeDeviceInputSystem.js";
import { WebDeviceInputSystem } from "./webDeviceInputSystem.js";
import { DeviceSource } from "./deviceSource.js";
/** @hidden */
var InternalDeviceSourceManager = /** @class */ (function () {
    function InternalDeviceSourceManager(engine) {
        var _this = this;
        this._registeredManagers = new Array();
        this._refCount = 0;
        // Public Functions
        this.registerManager = function (manager) {
            for (var deviceType = 0; deviceType < _this._devices.length; deviceType++) {
                var device = _this._devices[deviceType];
                for (var deviceSlotKey in device) {
                    var deviceSlot = +deviceSlotKey;
                    manager._addDevice(new DeviceSource(_this._deviceInputSystem, deviceType, deviceSlot));
                }
            }
            _this._registeredManagers.push(manager);
        };
        this.unregisterManager = function (manager) {
            var idx = _this._registeredManagers.indexOf(manager);
            if (idx > -1) {
                _this._registeredManagers.splice(idx, 1);
            }
        };
        var numberOfDeviceTypes = Object.keys(DeviceType).length / 2;
        this._devices = new Array(numberOfDeviceTypes);
        var onDeviceConnected = function (deviceType, deviceSlot) {
            if (!_this._devices[deviceType]) {
                _this._devices[deviceType] = new Array();
            }
            if (!_this._devices[deviceType][deviceSlot]) {
                _this._devices[deviceType][deviceSlot] = deviceSlot;
            }
            for (var _i = 0, _a = _this._registeredManagers; _i < _a.length; _i++) {
                var manager = _a[_i];
                var deviceSource = new DeviceSource(_this._deviceInputSystem, deviceType, deviceSlot);
                manager._addDevice(deviceSource);
            }
        };
        var onDeviceDisconnected = function (deviceType, deviceSlot) {
            var _a;
            if ((_a = _this._devices[deviceType]) === null || _a === void 0 ? void 0 : _a[deviceSlot]) {
                delete _this._devices[deviceType][deviceSlot];
            }
            for (var _i = 0, _b = _this._registeredManagers; _i < _b.length; _i++) {
                var manager = _b[_i];
                manager._removeDevice(deviceType, deviceSlot);
            }
        };
        var onInputChanged = function (deviceType, deviceSlot, eventData) {
            if (eventData) {
                for (var _i = 0, _a = _this._registeredManagers; _i < _a.length; _i++) {
                    var manager = _a[_i];
                    manager._onInputChanged(deviceType, deviceSlot, eventData);
                }
            }
        };
        if (typeof _native !== "undefined") {
            this._deviceInputSystem = new NativeDeviceInputSystem(onDeviceConnected, onDeviceDisconnected, onInputChanged);
        }
        else {
            this._deviceInputSystem = new WebDeviceInputSystem(engine, onDeviceConnected, onDeviceDisconnected, onInputChanged);
        }
    }
    InternalDeviceSourceManager.prototype.dispose = function () {
        this._deviceInputSystem.dispose();
    };
    return InternalDeviceSourceManager;
}());
export { InternalDeviceSourceManager };
//# sourceMappingURL=internalDeviceSourceManager.js.map
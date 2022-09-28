import { DeviceType } from "./deviceEnums.js";
import { Observable } from "../../Misc/observable.js";
import { InternalDeviceSourceManager } from "./internalDeviceSourceManager.js";
/**
 * Class to keep track of devices
 */
var DeviceSourceManager = /** @class */ (function () {
    /**
     * Default constructor
     * @param engine - Used to get canvas (if applicable)
     */
    function DeviceSourceManager(engine) {
        var _this = this;
        var numberOfDeviceTypes = Object.keys(DeviceType).length / 2;
        this._devices = new Array(numberOfDeviceTypes);
        this._firstDevice = new Array(numberOfDeviceTypes);
        this._engine = engine;
        if (!this._engine._deviceSourceManager) {
            this._engine._deviceSourceManager = new InternalDeviceSourceManager(engine);
        }
        this._engine._deviceSourceManager._refCount++;
        // Observables
        this.onDeviceConnectedObservable = new Observable(function (observer) {
            for (var _i = 0, _a = _this._devices; _i < _a.length; _i++) {
                var devices = _a[_i];
                if (devices) {
                    for (var _b = 0, devices_1 = devices; _b < devices_1.length; _b++) {
                        var device = devices_1[_b];
                        if (device) {
                            _this.onDeviceConnectedObservable.notifyObserver(observer, device);
                        }
                    }
                }
            }
        });
        this.onDeviceDisconnectedObservable = new Observable();
        this._engine._deviceSourceManager.registerManager(this);
        this._onDisposeObserver = engine.onDisposeObservable.add(function () {
            _this.dispose();
        });
    }
    // Public Functions
    /**
     * Gets a DeviceSource, given a type and slot
     * @param deviceType - Type of Device
     * @param deviceSlot - Slot or ID of device
     * @returns DeviceSource
     */
    DeviceSourceManager.prototype.getDeviceSource = function (deviceType, deviceSlot) {
        if (deviceSlot === undefined) {
            if (this._firstDevice[deviceType] === undefined) {
                return null;
            }
            deviceSlot = this._firstDevice[deviceType];
        }
        if (!this._devices[deviceType] || this._devices[deviceType][deviceSlot] === undefined) {
            return null;
        }
        return this._devices[deviceType][deviceSlot];
    };
    /**
     * Gets an array of DeviceSource objects for a given device type
     * @param deviceType - Type of Device
     * @returns All available DeviceSources of a given type
     */
    DeviceSourceManager.prototype.getDeviceSources = function (deviceType) {
        return this._devices[deviceType].filter(function (source) {
            return !!source;
        });
    };
    /**
     * Dispose of DeviceSourceManager
     */
    DeviceSourceManager.prototype.dispose = function () {
        // Null out observable refs
        this.onDeviceConnectedObservable.clear();
        this.onDeviceDisconnectedObservable.clear();
        if (this._engine._deviceSourceManager) {
            this._engine._deviceSourceManager.unregisterManager(this);
            if (--this._engine._deviceSourceManager._refCount < 1) {
                this._engine._deviceSourceManager.dispose();
                delete this._engine._deviceSourceManager;
            }
        }
        this._engine.onDisposeObservable.remove(this._onDisposeObserver);
    };
    // Hidden Functions
    /**
     * @param deviceSource - Source to add
     * @hidden
     */
    DeviceSourceManager.prototype._addDevice = function (deviceSource) {
        if (!this._devices[deviceSource.deviceType]) {
            this._devices[deviceSource.deviceType] = new Array();
        }
        if (!this._devices[deviceSource.deviceType][deviceSource.deviceSlot]) {
            this._devices[deviceSource.deviceType][deviceSource.deviceSlot] = deviceSource;
            this._updateFirstDevices(deviceSource.deviceType);
        }
        this.onDeviceConnectedObservable.notifyObservers(deviceSource);
    };
    /**
     * @param deviceType - DeviceType
     * @param deviceSlot - DeviceSlot
     * @hidden
     */
    DeviceSourceManager.prototype._removeDevice = function (deviceType, deviceSlot) {
        var _a, _b;
        var deviceSource = (_a = this._devices[deviceType]) === null || _a === void 0 ? void 0 : _a[deviceSlot]; // Grab local reference to use before removing from devices
        this.onDeviceDisconnectedObservable.notifyObservers(deviceSource);
        if ((_b = this._devices[deviceType]) === null || _b === void 0 ? void 0 : _b[deviceSlot]) {
            delete this._devices[deviceType][deviceSlot];
        }
        // Even if we don't delete a device, we should still check for the first device as things may have gotten out of sync.
        this._updateFirstDevices(deviceType);
    };
    /**
     * @param deviceType - DeviceType
     * @param deviceSlot - DeviceSlot
     * @param eventData - Event
     * @hidden
     */
    DeviceSourceManager.prototype._onInputChanged = function (deviceType, deviceSlot, eventData) {
        var _a, _b;
        (_b = (_a = this._devices[deviceType]) === null || _a === void 0 ? void 0 : _a[deviceSlot]) === null || _b === void 0 ? void 0 : _b.onInputChangedObservable.notifyObservers(eventData);
    };
    // Private Functions
    DeviceSourceManager.prototype._updateFirstDevices = function (type) {
        switch (type) {
            case DeviceType.Keyboard:
            case DeviceType.Mouse:
                this._firstDevice[type] = 0;
                break;
            case DeviceType.Touch:
            case DeviceType.DualSense:
            case DeviceType.DualShock:
            case DeviceType.Xbox:
            case DeviceType.Switch:
            case DeviceType.Generic: {
                delete this._firstDevice[type];
                // eslint-disable-next-line no-case-declarations
                var devices = this._devices[type];
                if (devices) {
                    for (var i = 0; i < devices.length; i++) {
                        if (devices[i]) {
                            this._firstDevice[type] = i;
                            break;
                        }
                    }
                }
                break;
            }
        }
    };
    return DeviceSourceManager;
}());
export { DeviceSourceManager };
//# sourceMappingURL=deviceSourceManager.js.map
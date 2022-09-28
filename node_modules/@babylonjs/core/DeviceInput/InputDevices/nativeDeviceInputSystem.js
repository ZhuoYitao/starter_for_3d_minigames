import { DeviceEventFactory } from "../Helpers/eventFactory.js";
import { DeviceType } from "./deviceEnums.js";
/** @hidden */
var NativeDeviceInputSystem = /** @class */ (function () {
    function NativeDeviceInputSystem(onDeviceConnected, onDeviceDisconnected, onInputChanged) {
        var _this = this;
        this._nativeInput = _native.DeviceInputSystem
            ? new _native.DeviceInputSystem(onDeviceConnected, onDeviceDisconnected, function (deviceType, deviceSlot, inputIndex, currentState) {
                var evt = DeviceEventFactory.CreateDeviceEvent(deviceType, deviceSlot, inputIndex, currentState, _this);
                onInputChanged(deviceType, deviceSlot, evt);
            })
            : this._createDummyNativeInput();
    }
    // Public functions
    /**
     * Checks for current device input value, given an id and input index. Throws exception if requested device not initialized.
     * @param deviceType Enum specifying device type
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @returns Current value of input
     */
    NativeDeviceInputSystem.prototype.pollInput = function (deviceType, deviceSlot, inputIndex) {
        return this._nativeInput.pollInput(deviceType, deviceSlot, inputIndex);
    };
    /**
     * Check for a specific device in the DeviceInputSystem
     * @param deviceType Type of device to check for
     * @returns bool with status of device's existence
     */
    NativeDeviceInputSystem.prototype.isDeviceAvailable = function (deviceType) {
        //TODO: FIx native side first
        return deviceType === DeviceType.Mouse || deviceType === DeviceType.Touch;
    };
    /**
     * Dispose of all the observables
     */
    NativeDeviceInputSystem.prototype.dispose = function () {
        this._nativeInput.dispose();
    };
    /**
     * For versions of BabylonNative that don't have the NativeInput plugin initialized, create a dummy version
     * @returns Object with dummy functions
     */
    NativeDeviceInputSystem.prototype._createDummyNativeInput = function () {
        var nativeInput = {
            pollInput: function () {
                return 0;
            },
            isDeviceAvailable: function () {
                return false;
            },
            dispose: function () { },
        };
        return nativeInput;
    };
    return NativeDeviceInputSystem;
}());
export { NativeDeviceInputSystem };
//# sourceMappingURL=nativeDeviceInputSystem.js.map
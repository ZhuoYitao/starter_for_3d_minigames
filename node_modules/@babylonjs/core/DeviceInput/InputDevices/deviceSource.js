import { Observable } from "../../Misc/observable.js";
/**
 * Class that handles all input for a specific device
 */
var DeviceSource = /** @class */ (function () {
    /**
     * Default Constructor
     * @param deviceInputSystem - Reference to DeviceInputSystem
     * @param deviceType - Type of device
     * @param deviceSlot - "Slot" or index that device is referenced in
     */
    function DeviceSource(deviceInputSystem, 
    /** Type of device */
    deviceType, 
    /** "Slot" or index that device is referenced in */
    deviceSlot) {
        if (deviceSlot === void 0) { deviceSlot = 0; }
        this.deviceType = deviceType;
        this.deviceSlot = deviceSlot;
        // Public Members
        /**
         * Observable to handle device input changes per device
         */
        this.onInputChangedObservable = new Observable();
        this._deviceInputSystem = deviceInputSystem;
    }
    /**
     * Get input for specific input
     * @param inputIndex - index of specific input on device
     * @returns Input value from DeviceInputSystem
     */
    DeviceSource.prototype.getInput = function (inputIndex) {
        return this._deviceInputSystem.pollInput(this.deviceType, this.deviceSlot, inputIndex);
    };
    return DeviceSource;
}());
export { DeviceSource };
//# sourceMappingURL=deviceSource.js.map

import { EventConstants } from "../../Events/deviceInputEvents.js";
import { DeviceType, NativePointerInput, PointerInput } from "../InputDevices/deviceEnums.js";
/**
 * Class to wrap DeviceInputSystem data into an event object
 */
var DeviceEventFactory = /** @class */ (function () {
    function DeviceEventFactory() {
    }
    /**
     * Create device input events based on provided type and slot
     *
     * @param deviceType Type of device
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @param currentState Current value for given input
     * @param deviceInputSystem Reference to DeviceInputSystem
     * @param elementToAttachTo HTMLElement to reference as target for inputs
     * @returns IUIEvent object
     */
    DeviceEventFactory.CreateDeviceEvent = function (deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo) {
        switch (deviceType) {
            case DeviceType.Keyboard:
                return this._CreateKeyboardEvent(inputIndex, currentState, deviceInputSystem, elementToAttachTo);
            case DeviceType.Mouse:
                if (inputIndex === PointerInput.MouseWheelX || inputIndex === PointerInput.MouseWheelY || inputIndex === PointerInput.MouseWheelZ) {
                    return this._CreateWheelEvent(deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo);
                }
            // eslint-disable-next-line no-fallthrough
            case DeviceType.Touch:
                return this._CreatePointerEvent(deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo);
            default:
                throw "Unable to generate event for device ".concat(DeviceType[deviceType]);
        }
    };
    /**
     * Creates pointer event
     *
     * @param deviceType Type of device
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @param currentState Current value for given input
     * @param deviceInputSystem Reference to DeviceInputSystem
     * @param elementToAttachTo HTMLElement to reference as target for inputs
     * @returns IUIEvent object (Pointer)
     */
    DeviceEventFactory._CreatePointerEvent = function (deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo) {
        var evt = this._CreateMouseEvent(deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo);
        if (deviceType === DeviceType.Mouse) {
            evt.deviceType = DeviceType.Mouse;
            evt.pointerId = 1;
            evt.pointerType = "mouse";
        }
        else {
            evt.deviceType = DeviceType.Touch;
            evt.pointerId = deviceSlot;
            evt.pointerType = "touch";
        }
        if (inputIndex === PointerInput.Move) {
            evt.type = "pointermove";
        }
        else if (inputIndex >= PointerInput.LeftClick && inputIndex <= PointerInput.RightClick) {
            evt.type = currentState === 1 ? "pointerdown" : "pointerup";
            evt.button = inputIndex - 2;
        }
        return evt;
    };
    /**
     * Create Mouse Wheel Event
     * @param deviceType Type of device
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @param currentState Current value for given input
     * @param deviceInputSystem Reference to DeviceInputSystem
     * @param elementToAttachTo HTMLElement to reference as target for inputs
     * @returns IUIEvent object (Wheel)
     */
    DeviceEventFactory._CreateWheelEvent = function (deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo) {
        var evt = this._CreateMouseEvent(deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo);
        evt.type = "wheel";
        evt.deltaMode = EventConstants.DOM_DELTA_PIXEL;
        evt.deltaX = 0;
        evt.deltaY = 0;
        evt.deltaZ = 0;
        switch (inputIndex) {
            case PointerInput.MouseWheelX:
                evt.deltaX = currentState;
                break;
            case PointerInput.MouseWheelY:
                evt.deltaY = currentState;
                break;
            case PointerInput.MouseWheelZ:
                evt.deltaZ = currentState;
                break;
        }
        return evt;
    };
    /**
     * Create Mouse Event
     * @param deviceType Type of device
     * @param deviceSlot "Slot" or index that device is referenced in
     * @param inputIndex Id of input to be checked
     * @param currentState Current value for given input
     * @param deviceInputSystem Reference to DeviceInputSystem
     * @param elementToAttachTo HTMLElement to reference as target for inputs
     * @returns IUIEvent object (Mouse)
     */
    DeviceEventFactory._CreateMouseEvent = function (deviceType, deviceSlot, inputIndex, currentState, deviceInputSystem, elementToAttachTo) {
        var evt = this._CreateEvent(elementToAttachTo);
        var pointerX = deviceInputSystem.pollInput(deviceType, deviceSlot, PointerInput.Horizontal);
        var pointerY = deviceInputSystem.pollInput(deviceType, deviceSlot, PointerInput.Vertical);
        // Handle offsets/deltas based on existence of HTMLElement
        if (elementToAttachTo) {
            evt.movementX = 0;
            evt.movementY = 0;
            evt.offsetX = evt.movementX - elementToAttachTo.getBoundingClientRect().x;
            evt.offsetY = evt.movementY - elementToAttachTo.getBoundingClientRect().y;
        }
        else {
            evt.movementX = deviceInputSystem.pollInput(deviceType, deviceSlot, NativePointerInput.DeltaHorizontal); // DeltaHorizontal
            evt.movementY = deviceInputSystem.pollInput(deviceType, deviceSlot, NativePointerInput.DeltaVertical); // DeltaVertical
            evt.offsetX = 0;
            evt.offsetY = 0;
        }
        this._CheckNonCharacterKeys(evt, deviceInputSystem);
        evt.clientX = pointerX;
        evt.clientY = pointerY;
        evt.x = pointerX;
        evt.y = pointerY;
        evt.deviceType = deviceType;
        evt.deviceSlot = deviceSlot;
        evt.inputIndex = inputIndex;
        return evt;
    };
    /**
     * Create Keyboard Event
     * @param inputIndex Id of input to be checked
     * @param currentState Current value for given input
     * @param deviceInputSystem Reference to DeviceInputSystem
     * @param elementToAttachTo HTMLElement to reference as target for inputs
     * @returns IEvent object (Keyboard)
     */
    DeviceEventFactory._CreateKeyboardEvent = function (inputIndex, currentState, deviceInputSystem, elementToAttachTo) {
        var evt = this._CreateEvent(elementToAttachTo);
        this._CheckNonCharacterKeys(evt, deviceInputSystem);
        evt.deviceType = DeviceType.Keyboard;
        evt.deviceSlot = 0;
        evt.inputIndex = inputIndex;
        evt.type = currentState === 1 ? "keydown" : "keyup";
        evt.key = String.fromCharCode(inputIndex);
        evt.keyCode = inputIndex;
        return evt;
    };
    /**
     * Add parameters for non-character keys (Ctrl, Alt, Meta, Shift)
     * @param evt Event object to add parameters to
     * @param deviceInputSystem DeviceInputSystem to pull values from
     */
    DeviceEventFactory._CheckNonCharacterKeys = function (evt, deviceInputSystem) {
        var isKeyboardActive = deviceInputSystem.isDeviceAvailable(DeviceType.Keyboard);
        var altKey = isKeyboardActive && deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 18) === 1;
        var ctrlKey = isKeyboardActive && deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 17) === 1;
        var metaKey = isKeyboardActive &&
            (deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 91) === 1 ||
                deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 92) === 1 ||
                deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 93) === 1);
        var shiftKey = isKeyboardActive && deviceInputSystem.pollInput(DeviceType.Keyboard, 0, 16) === 1;
        evt.altKey = altKey;
        evt.ctrlKey = ctrlKey;
        evt.metaKey = metaKey;
        evt.shiftKey = shiftKey;
    };
    /**
     * Create base event object
     * @param elementToAttachTo Value to use as event target
     * @returns
     */
    DeviceEventFactory._CreateEvent = function (elementToAttachTo) {
        var evt = {};
        evt.preventDefault = function () { };
        evt.target = elementToAttachTo;
        return evt;
    };
    return DeviceEventFactory;
}());
export { DeviceEventFactory };
//# sourceMappingURL=eventFactory.js.map
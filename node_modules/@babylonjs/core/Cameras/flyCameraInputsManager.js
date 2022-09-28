import { __extends } from "tslib";
import { CameraInputsManager } from "./cameraInputsManager.js";
import { FlyCameraMouseInput } from "../Cameras/Inputs/flyCameraMouseInput.js";
import { FlyCameraKeyboardInput } from "../Cameras/Inputs/flyCameraKeyboardInput.js";
/**
 * Default Inputs manager for the FlyCamera.
 * It groups all the default supported inputs for ease of use.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FlyCameraInputsManager = /** @class */ (function (_super) {
    __extends(FlyCameraInputsManager, _super);
    /**
     * Instantiates a new FlyCameraInputsManager.
     * @param camera Defines the camera the inputs belong to.
     */
    function FlyCameraInputsManager(camera) {
        return _super.call(this, camera) || this;
    }
    /**
     * Add keyboard input support to the input manager.
     * @returns the new FlyCameraKeyboardMoveInput().
     */
    FlyCameraInputsManager.prototype.addKeyboard = function () {
        this.add(new FlyCameraKeyboardInput());
        return this;
    };
    /**
     * Add mouse input support to the input manager.
     * @returns the new FlyCameraMouseInput().
     */
    FlyCameraInputsManager.prototype.addMouse = function () {
        this.add(new FlyCameraMouseInput());
        return this;
    };
    return FlyCameraInputsManager;
}(CameraInputsManager));
export { FlyCameraInputsManager };
//# sourceMappingURL=flyCameraInputsManager.js.map
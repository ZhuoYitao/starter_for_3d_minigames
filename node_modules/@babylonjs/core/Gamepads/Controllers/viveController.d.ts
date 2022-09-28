import type { Scene } from "../../scene";
import type { AbstractMesh } from "../../Meshes/abstractMesh";
import { WebVRController } from "./webVRController";
import type { ExtendedGamepadButton } from "./poseEnabledController";
import type { Observable } from "../../Misc/observable";
/**
 * Vive Controller
 */
export declare class ViveController extends WebVRController {
    /**
     * Base Url for the controller model.
     */
    static MODEL_BASE_URL: string;
    /**
     * File name for the controller model.
     */
    static MODEL_FILENAME: string;
    /**
     * Creates a new ViveController from a gamepad
     * @param vrGamepad the gamepad that the controller should be created from
     */
    constructor(vrGamepad: any);
    /**
     * Implements abstract method on WebVRController class, loading controller meshes and calling this.attachToMesh if successful.
     * @param scene scene in which to add meshes
     * @param meshLoaded optional callback function that will be called if the mesh loads successfully.
     */
    initControllerMesh(scene: Scene, meshLoaded?: (mesh: AbstractMesh) => void): void;
    /**
     * Fired when the left button on this controller is modified
     */
    get onLeftButtonStateChangedObservable(): Observable<ExtendedGamepadButton>;
    /**
     * Fired when the right button on this controller is modified
     */
    get onRightButtonStateChangedObservable(): Observable<ExtendedGamepadButton>;
    /**
     * Fired when the menu button on this controller is modified
     */
    get onMenuButtonStateChangedObservable(): Observable<ExtendedGamepadButton>;
    /**
     * Called once for each button that changed state since the last frame
     * Vive mapping:
     * 0: touchpad
     * 1: trigger
     * 2: left AND right buttons
     * 3: menu button
     * @param buttonIdx Which button index changed
     * @param state New state of the button
     */
    protected _handleButtonChange(buttonIdx: number, state: ExtendedGamepadButton): void;
}

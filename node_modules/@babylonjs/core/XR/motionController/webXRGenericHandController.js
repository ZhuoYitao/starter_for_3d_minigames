import { __extends } from "tslib";
import { WebXRAbstractMotionController } from "./webXRAbstractMotionController.js";
import { WebXRMotionControllerManager } from "./webXRMotionControllerManager.js";
/**
 * A generic hand controller class that supports select and a secondary grasp
 */
var WebXRGenericHandController = /** @class */ (function (_super) {
    __extends(WebXRGenericHandController, _super);
    /**
     * Create a new hand controller object, without loading a controller model
     * @param scene the scene to use to create this controller
     * @param gamepadObject the corresponding gamepad object
     * @param handedness the handedness of the controller
     */
    function WebXRGenericHandController(scene, gamepadObject, handedness) {
        var _this = 
        // Don't load the controller model - for now, hands have no real model.
        _super.call(this, scene, GenericHandSelectGraspProfile[handedness], gamepadObject, handedness, true) || this;
        _this.profileId = "generic-hand-select-grasp";
        return _this;
    }
    WebXRGenericHandController.prototype._getFilenameAndPath = function () {
        return {
            filename: "generic.babylon",
            path: "https://controllers.babylonjs.com/generic/",
        };
    };
    WebXRGenericHandController.prototype._getModelLoadingConstraints = function () {
        return true;
    };
    WebXRGenericHandController.prototype._processLoadedModel = function (_meshes) {
        // no-op
    };
    WebXRGenericHandController.prototype._setRootMesh = function (meshes) {
        // no-op
    };
    WebXRGenericHandController.prototype._updateModel = function () {
        // no-op
    };
    return WebXRGenericHandController;
}(WebXRAbstractMotionController));
export { WebXRGenericHandController };
// register the profiles
WebXRMotionControllerManager.RegisterController("generic-hand-select-grasp", function (xrInput, scene) {
    return new WebXRGenericHandController(scene, xrInput.gamepad, xrInput.handedness);
});
// https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/registry/profiles/generic/generic-hand-select-grasp.json
var GenericHandSelectGraspProfile = {
    left: {
        selectComponentId: "xr-standard-trigger",
        components: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "xr-standard-trigger": {
                type: "trigger",
                gamepadIndices: {
                    button: 0,
                },
                rootNodeName: "xr-standard-trigger",
                visualResponses: {},
            },
            grasp: {
                type: "trigger",
                gamepadIndices: {
                    button: 4,
                },
                rootNodeName: "grasp",
                visualResponses: {},
            },
        },
        gamepadMapping: "xr-standard",
        rootNodeName: "generic-hand-select-grasp-left",
        assetPath: "left.glb",
    },
    right: {
        selectComponentId: "xr-standard-trigger",
        components: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "xr-standard-trigger": {
                type: "trigger",
                gamepadIndices: {
                    button: 0,
                },
                rootNodeName: "xr-standard-trigger",
                visualResponses: {},
            },
            grasp: {
                type: "trigger",
                gamepadIndices: {
                    button: 4,
                },
                rootNodeName: "grasp",
                visualResponses: {},
            },
        },
        gamepadMapping: "xr-standard",
        rootNodeName: "generic-hand-select-grasp-right",
        assetPath: "right.glb",
    },
    none: {
        selectComponentId: "xr-standard-trigger",
        components: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "xr-standard-trigger": {
                type: "trigger",
                gamepadIndices: {
                    button: 0,
                },
                rootNodeName: "xr-standard-trigger",
                visualResponses: {},
            },
            grasp: {
                type: "trigger",
                gamepadIndices: {
                    button: 4,
                },
                rootNodeName: "grasp",
                visualResponses: {},
            },
        },
        gamepadMapping: "xr-standard",
        rootNodeName: "generic-hand-select-grasp-none",
        assetPath: "none.glb",
    },
};
//# sourceMappingURL=webXRGenericHandController.js.map
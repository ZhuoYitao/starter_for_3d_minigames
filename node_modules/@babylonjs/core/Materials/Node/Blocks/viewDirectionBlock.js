import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { NodeMaterialSystemValues } from "../Enums/nodeMaterialSystemValues.js";
import { InputBlock } from "./Input/inputBlock.js";
/**
 * Block used to get the view direction
 */
var ViewDirectionBlock = /** @class */ (function (_super) {
    __extends(ViewDirectionBlock, _super);
    /**
     * Creates a new ViewDirectionBlock
     * @param name defines the block name
     */
    function ViewDirectionBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("cameraPosition", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector3);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ViewDirectionBlock.prototype.getClassName = function () {
        return "ViewDirectionBlock";
    };
    Object.defineProperty(ViewDirectionBlock.prototype, "worldPosition", {
        /**
         * Gets the world position component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewDirectionBlock.prototype, "cameraPosition", {
        /**
         * Gets the camera position component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewDirectionBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ViewDirectionBlock.prototype.autoConfigure = function (material) {
        if (!this.cameraPosition.isConnected) {
            var cameraPositionInput = material.getInputBlockByPredicate(function (b) { return b.systemValue === NodeMaterialSystemValues.CameraPosition; });
            if (!cameraPositionInput) {
                cameraPositionInput = new InputBlock("cameraPosition");
                cameraPositionInput.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);
            }
            cameraPositionInput.output.connectTo(this.cameraPosition);
        }
    };
    ViewDirectionBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) + " = normalize(".concat(this.cameraPosition.associatedVariableName, " - ").concat(this.worldPosition.associatedVariableName, ".xyz);\r\n");
        return this;
    };
    return ViewDirectionBlock;
}(NodeMaterialBlock));
export { ViewDirectionBlock };
RegisterClass("BABYLON.ViewDirectionBlock", ViewDirectionBlock);
//# sourceMappingURL=viewDirectionBlock.js.map
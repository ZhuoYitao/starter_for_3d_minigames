import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get the refracted vector from a direction and a normal
 */
var RefractBlock = /** @class */ (function (_super) {
    __extends(RefractBlock, _super);
    /**
     * Creates a new RefractBlock
     * @param name defines the block name
     */
    function RefractBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("incident", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("normal", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("ior", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    RefractBlock.prototype.getClassName = function () {
        return "RefractBlock";
    };
    Object.defineProperty(RefractBlock.prototype, "incident", {
        /**
         * Gets the incident component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractBlock.prototype, "normal", {
        /**
         * Gets the normal component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractBlock.prototype, "ior", {
        /**
         * Gets the index of refraction component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RefractBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    RefractBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) +
                " = refract(".concat(this.incident.associatedVariableName, ".xyz, ").concat(this.normal.associatedVariableName, ".xyz, ").concat(this.ior.associatedVariableName, ");\r\n");
        return this;
    };
    return RefractBlock;
}(NodeMaterialBlock));
export { RefractBlock };
RegisterClass("BABYLON.RefractBlock", RefractBlock);
//# sourceMappingURL=refractBlock.js.map
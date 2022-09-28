import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to get the reflected vector from a direction and a normal
 */
var ReflectBlock = /** @class */ (function (_super) {
    __extends(ReflectBlock, _super);
    /**
     * Creates a new ReflectBlock
     * @param name defines the block name
     */
    function ReflectBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("incident", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("normal", NodeMaterialBlockConnectionPointTypes.Vector3);
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
    ReflectBlock.prototype.getClassName = function () {
        return "ReflectBlock";
    };
    Object.defineProperty(ReflectBlock.prototype, "incident", {
        /**
         * Gets the incident component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectBlock.prototype, "normal", {
        /**
         * Gets the normal component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ReflectBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = reflect(".concat(this.incident.associatedVariableName, ".xyz, ").concat(this.normal.associatedVariableName, ".xyz);\r\n");
        return this;
    };
    return ReflectBlock;
}(NodeMaterialBlock));
export { ReflectBlock };
RegisterClass("BABYLON.ReflectBlock", ReflectBlock);
//# sourceMappingURL=reflectBlock.js.map
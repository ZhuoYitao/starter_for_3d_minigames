import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to blend normals
 */
var NormalBlendBlock = /** @class */ (function (_super) {
    __extends(NormalBlendBlock, _super);
    /**
     * Creates a new NormalBlendBlock
     * @param name defines the block name
     */
    function NormalBlendBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("normalMap0", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("normalMap1", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        _this._inputs[1].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    NormalBlendBlock.prototype.getClassName = function () {
        return "NormalBlendBlock";
    };
    Object.defineProperty(NormalBlendBlock.prototype, "normalMap0", {
        /**
         * Gets the first input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NormalBlendBlock.prototype, "normalMap1", {
        /**
         * Gets the second input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NormalBlendBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    NormalBlendBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var input0 = this._inputs[0];
        var input1 = this._inputs[1];
        var stepR = state._getFreeVariableName("stepR");
        var stepG = state._getFreeVariableName("stepG");
        state.compilationString += "float ".concat(stepR, " = step(0.5, ").concat(input0.associatedVariableName, ".r);\r\n");
        state.compilationString += "float ".concat(stepG, " = step(0.5, ").concat(input0.associatedVariableName, ".g);\r\n");
        state.compilationString += this._declareOutput(output, state) + ";\r\n";
        state.compilationString += "".concat(output.associatedVariableName, ".r = (1.0 - ").concat(stepR, ") * ").concat(input0.associatedVariableName, ".r * ").concat(input1.associatedVariableName, ".r * 2.0 + ").concat(stepR, " * (1.0 - (1.0 - ").concat(input0.associatedVariableName, ".r) * (1.0 - ").concat(input1.associatedVariableName, ".r) * 2.0);\r\n");
        state.compilationString += "".concat(output.associatedVariableName, ".g = (1.0 - ").concat(stepG, ") * ").concat(input0.associatedVariableName, ".g * ").concat(input1.associatedVariableName, ".g * 2.0 + ").concat(stepG, " * (1.0 - (1.0 - ").concat(input0.associatedVariableName, ".g) * (1.0 - ").concat(input1.associatedVariableName, ".g) * 2.0);\r\n");
        state.compilationString += "".concat(output.associatedVariableName, ".b = ").concat(input0.associatedVariableName, ".b * ").concat(input1.associatedVariableName, ".b;\r\n");
        return this;
    };
    return NormalBlendBlock;
}(NodeMaterialBlock));
export { NormalBlendBlock };
RegisterClass("BABYLON.NormalBlendBlock", NormalBlendBlock);
//# sourceMappingURL=normalBlendBlock.js.map
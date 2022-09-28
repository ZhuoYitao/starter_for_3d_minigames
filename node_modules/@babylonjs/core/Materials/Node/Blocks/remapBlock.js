import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { Vector2 } from "../../../Maths/math.vector.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../nodeMaterialDecorator.js";
/**
 * Block used to remap a float from a range to a new one
 */
var RemapBlock = /** @class */ (function (_super) {
    __extends(RemapBlock, _super);
    /**
     * Creates a new RemapBlock
     * @param name defines the block name
     */
    function RemapBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Gets or sets the source range
         */
        _this.sourceRange = new Vector2(-1, 1);
        /**
         * Gets or sets the target range
         */
        _this.targetRange = new Vector2(0, 1);
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("sourceMin", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("sourceMax", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("targetMin", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("targetMax", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    RemapBlock.prototype.getClassName = function () {
        return "RemapBlock";
    };
    Object.defineProperty(RemapBlock.prototype, "input", {
        /**
         * Gets the input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemapBlock.prototype, "sourceMin", {
        /**
         * Gets the source min input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemapBlock.prototype, "sourceMax", {
        /**
         * Gets the source max input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemapBlock.prototype, "targetMin", {
        /**
         * Gets the target min input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemapBlock.prototype, "targetMax", {
        /**
         * Gets the target max input component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemapBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    RemapBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var sourceMin = this.sourceMin.isConnected ? this.sourceMin.associatedVariableName : this._writeFloat(this.sourceRange.x);
        var sourceMax = this.sourceMax.isConnected ? this.sourceMax.associatedVariableName : this._writeFloat(this.sourceRange.y);
        var targetMin = this.targetMin.isConnected ? this.targetMin.associatedVariableName : this._writeFloat(this.targetRange.x);
        var targetMax = this.targetMax.isConnected ? this.targetMax.associatedVariableName : this._writeFloat(this.targetRange.y);
        state.compilationString +=
            this._declareOutput(output, state) +
                " = ".concat(targetMin, " + (").concat(this._inputs[0].associatedVariableName, " - ").concat(sourceMin, ") * (").concat(targetMax, " - ").concat(targetMin, ") / (").concat(sourceMax, " - ").concat(sourceMin, ");\r\n");
        return this;
    };
    RemapBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this) + "".concat(this._codeVariableName, ".sourceRange = new BABYLON.Vector2(").concat(this.sourceRange.x, ", ").concat(this.sourceRange.y, ");\r\n");
        codeString += "".concat(this._codeVariableName, ".targetRange = new BABYLON.Vector2(").concat(this.targetRange.x, ", ").concat(this.targetRange.y, ");\r\n");
        return codeString;
    };
    RemapBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.sourceRange = this.sourceRange.asArray();
        serializationObject.targetRange = this.targetRange.asArray();
        return serializationObject;
    };
    RemapBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.sourceRange = Vector2.FromArray(serializationObject.sourceRange);
        this.targetRange = Vector2.FromArray(serializationObject.targetRange);
    };
    __decorate([
        editableInPropertyPage("From", PropertyTypeForEdition.Vector2)
    ], RemapBlock.prototype, "sourceRange", void 0);
    __decorate([
        editableInPropertyPage("To", PropertyTypeForEdition.Vector2)
    ], RemapBlock.prototype, "targetRange", void 0);
    return RemapBlock;
}(NodeMaterialBlock));
export { RemapBlock };
RegisterClass("BABYLON.RemapBlock", RemapBlock);
//# sourceMappingURL=remapBlock.js.map
import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Custom block created from user-defined json
 */
var CustomBlock = /** @class */ (function (_super) {
    __extends(CustomBlock, _super);
    /**
     * Creates a new CustomBlock
     * @param name defines the block name
     */
    function CustomBlock(name) {
        return _super.call(this, name) || this;
    }
    Object.defineProperty(CustomBlock.prototype, "options", {
        /**
         * Gets or sets the options for this custom block
         */
        get: function () {
            return this._options;
        },
        set: function (options) {
            this._deserializeOptions(options);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name
     * @returns the class name
     */
    CustomBlock.prototype.getClassName = function () {
        return "CustomBlock";
    };
    CustomBlock.prototype._buildBlock = function (state) {
        var _this = this;
        _super.prototype._buildBlock.call(this, state);
        var code = this._code;
        var functionName = this._options.functionName;
        // Replace the TYPE_XXX placeholders (if any)
        this._inputs.forEach(function (input) {
            var rexp = new RegExp("\\{TYPE_" + input.name + "\\}", "gm");
            var type = state._getGLType(input.type);
            code = code.replace(rexp, type);
            functionName = functionName.replace(rexp, type);
        });
        this._outputs.forEach(function (output) {
            var rexp = new RegExp("\\{TYPE_" + output.name + "\\}", "gm");
            var type = state._getGLType(output.type);
            code = code.replace(rexp, type);
            functionName = functionName.replace(rexp, type);
        });
        state._emitFunction(functionName, code, "");
        // Declare the output variables
        this._outputs.forEach(function (output) {
            state.compilationString += _this._declareOutput(output, state) + ";\r\n";
        });
        // Generate the function call
        state.compilationString += functionName + "(";
        var hasInput = false;
        this._inputs.forEach(function (input, index) {
            if (index > 0) {
                state.compilationString += ", ";
            }
            state.compilationString += input.associatedVariableName;
            hasInput = true;
        });
        this._outputs.forEach(function (output, index) {
            if (index > 0 || hasInput) {
                state.compilationString += ", ";
            }
            state.compilationString += output.associatedVariableName;
        });
        state.compilationString += ");\r\n";
        return this;
    };
    CustomBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".options = ").concat(JSON.stringify(this._options), ";\r\n");
        return codeString;
    };
    CustomBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.options = this._options;
        return serializationObject;
    };
    CustomBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        this._deserializeOptions(serializationObject.options);
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
    };
    CustomBlock.prototype._deserializeOptions = function (options) {
        var _this = this;
        var _a, _b, _c;
        this._options = options;
        this._code = options.code.join("\r\n") + "\r\n";
        this.name = this.name || options.name;
        this.target = NodeMaterialBlockTargets[options.target];
        (_a = options.inParameters) === null || _a === void 0 ? void 0 : _a.forEach(function (input, index) {
            var type = NodeMaterialBlockConnectionPointTypes[input.type];
            _this.registerInput(input.name, type);
            Object.defineProperty(_this, input.name, {
                get: function () {
                    return this._inputs[index];
                },
                enumerable: true,
                configurable: true,
            });
        });
        (_b = options.outParameters) === null || _b === void 0 ? void 0 : _b.forEach(function (output, index) {
            _this.registerOutput(output.name, NodeMaterialBlockConnectionPointTypes[output.type]);
            Object.defineProperty(_this, output.name, {
                get: function () {
                    return this._outputs[index];
                },
                enumerable: true,
                configurable: true,
            });
            if (output.type === "BasedOnInput") {
                _this._outputs[index]._typeConnectionSource = _this._findInputByName(output.typeFromInput)[0];
            }
        });
        (_c = options.inLinkedConnectionTypes) === null || _c === void 0 ? void 0 : _c.forEach(function (connection) {
            _this._linkConnectionTypes(_this._findInputByName(connection.input1)[1], _this._findInputByName(connection.input2)[1]);
        });
    };
    CustomBlock.prototype._findInputByName = function (name) {
        if (!name) {
            return null;
        }
        for (var i = 0; i < this._inputs.length; i++) {
            if (this._inputs[i].name === name) {
                return [this._inputs[i], i];
            }
        }
        return null;
    };
    return CustomBlock;
}(NodeMaterialBlock));
export { CustomBlock };
RegisterClass("BABYLON.CustomBlock", CustomBlock);
//# sourceMappingURL=customBlock.js.map
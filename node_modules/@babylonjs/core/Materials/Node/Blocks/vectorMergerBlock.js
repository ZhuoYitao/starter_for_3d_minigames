import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to create a Vector2/3/4 out of individual inputs (one for each component)
 */
var VectorMergerBlock = /** @class */ (function (_super) {
    __extends(VectorMergerBlock, _super);
    /**
     * Create a new VectorMergerBlock
     * @param name defines the block name
     */
    function VectorMergerBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        /**
         * Gets or sets the swizzle for x (meaning which component to affect to the output.x)
         */
        _this.xSwizzle = "x";
        /**
         * Gets or sets the swizzle for y (meaning which component to affect to the output.y)
         */
        _this.ySwizzle = "y";
        /**
         * Gets or sets the swizzle for z (meaning which component to affect to the output.z)
         */
        _this.zSwizzle = "z";
        /**
         * Gets or sets the swizzle for w (meaning which component to affect to the output.w)
         */
        _this.wSwizzle = "w";
        _this.registerInput("xyzw ", NodeMaterialBlockConnectionPointTypes.Vector4, true);
        _this.registerInput("xyz ", NodeMaterialBlockConnectionPointTypes.Vector3, true);
        _this.registerInput("xy ", NodeMaterialBlockConnectionPointTypes.Vector2, true);
        _this.registerInput("zw ", NodeMaterialBlockConnectionPointTypes.Vector2, true);
        _this.registerInput("x", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("y", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("z", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerInput("w", NodeMaterialBlockConnectionPointTypes.Float, true);
        _this.registerOutput("xyzw", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerOutput("xyz", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("xy", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("zw", NodeMaterialBlockConnectionPointTypes.Vector2);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    VectorMergerBlock.prototype.getClassName = function () {
        return "VectorMergerBlock";
    };
    Object.defineProperty(VectorMergerBlock.prototype, "xyzwIn", {
        /**
         * Gets the xyzw component (input)
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyzIn", {
        /**
         * Gets the xyz component (input)
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyIn", {
        /**
         * Gets the xy component (input)
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "zwIn", {
        /**
         * Gets the zw component (input)
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "x", {
        /**
         * Gets the x component (input)
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "y", {
        /**
         * Gets the y component (input)
         */
        get: function () {
            return this._inputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "z", {
        /**
         * Gets the z component (input)
         */
        get: function () {
            return this._inputs[6];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "w", {
        /**
         * Gets the w component (input)
         */
        get: function () {
            return this._inputs[7];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyzw", {
        /**
         * Gets the xyzw component (output)
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyzOut", {
        /**
         * Gets the xyz component (output)
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyOut", {
        /**
         * Gets the xy component (output)
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "zwOut", {
        /**
         * Gets the zw component (output)
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xy", {
        /**
         * Gets the xy component (output)
         * @deprecated Please use xyOut instead.
         */
        get: function () {
            return this.xyOut;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VectorMergerBlock.prototype, "xyz", {
        /**
         * Gets the xyz component (output)
         * @deprecated Please use xyzOut instead.
         */
        get: function () {
            return this.xyzOut;
        },
        enumerable: false,
        configurable: true
    });
    VectorMergerBlock.prototype._inputRename = function (name) {
        if (name === "xyzw ") {
            return "xyzwIn";
        }
        if (name === "xyz ") {
            return "xyzIn";
        }
        if (name === "xy ") {
            return "xyIn";
        }
        if (name === "zw ") {
            return "zwIn";
        }
        return name;
    };
    VectorMergerBlock.prototype._buildSwizzle = function (len) {
        var swizzle = this.xSwizzle + this.ySwizzle + this.zSwizzle + this.wSwizzle;
        return "." + swizzle.substr(0, len);
    };
    VectorMergerBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var xInput = this.x;
        var yInput = this.y;
        var zInput = this.z;
        var wInput = this.w;
        var xyInput = this.xyIn;
        var zwInput = this.zwIn;
        var xyzInput = this.xyzIn;
        var xyzwInput = this.xyzwIn;
        var v4Output = this._outputs[0];
        var v3Output = this._outputs[1];
        var v2Output = this._outputs[2];
        var v2CompOutput = this._outputs[3];
        if (xyzwInput.isConnected) {
            if (v4Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v4Output, state) + " = ".concat(xyzwInput.associatedVariableName).concat(this._buildSwizzle(4), ";\r\n");
            }
            if (v3Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v3Output, state) + " = ".concat(xyzwInput.associatedVariableName).concat(this._buildSwizzle(3), ";\r\n");
            }
            if (v2Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v2Output, state) + " = ".concat(xyzwInput.associatedVariableName).concat(this._buildSwizzle(2), ";\r\n");
            }
        }
        else if (xyzInput.isConnected) {
            if (v4Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(v4Output, state) +
                        " = vec4(".concat(xyzInput.associatedVariableName, ", ").concat(wInput.isConnected ? this._writeVariable(wInput) : "0.0", ")").concat(this._buildSwizzle(4), ";\r\n");
            }
            if (v3Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v3Output, state) + " = ".concat(xyzInput.associatedVariableName).concat(this._buildSwizzle(3), ";\r\n");
            }
            if (v2Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v2Output, state) + " = ".concat(xyzInput.associatedVariableName).concat(this._buildSwizzle(2), ";\r\n");
            }
        }
        else if (xyInput.isConnected) {
            if (v4Output.hasEndpoints) {
                if (zwInput.isConnected) {
                    state.compilationString +=
                        this._declareOutput(v4Output, state) + " = vec4(".concat(xyInput.associatedVariableName, ", ").concat(zwInput.associatedVariableName, ")").concat(this._buildSwizzle(4), ";\r\n");
                }
                else {
                    state.compilationString +=
                        this._declareOutput(v4Output, state) +
                            " = vec4(".concat(xyInput.associatedVariableName, ", ").concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ", ").concat(wInput.isConnected ? this._writeVariable(wInput) : "0.0", ")").concat(this._buildSwizzle(4), ";\r\n");
                }
            }
            if (v3Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(v3Output, state) +
                        " = vec3(".concat(xyInput.associatedVariableName, ", ").concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ")").concat(this._buildSwizzle(3), ";\r\n");
            }
            if (v2Output.hasEndpoints) {
                state.compilationString += this._declareOutput(v2Output, state) + " = ".concat(xyInput.associatedVariableName).concat(this._buildSwizzle(2), ";\r\n");
            }
            if (v2CompOutput.hasEndpoints) {
                if (zwInput.isConnected) {
                    state.compilationString += this._declareOutput(v2CompOutput, state) + " = ".concat(zwInput.associatedVariableName).concat(this._buildSwizzle(2), ";\r\n");
                }
                else {
                    state.compilationString +=
                        this._declareOutput(v2CompOutput, state) +
                            " = vec2(".concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ", ").concat(wInput.isConnected ? this._writeVariable(wInput) : "0.0", ")").concat(this._buildSwizzle(2), ";\r\n");
                }
            }
        }
        else {
            if (v4Output.hasEndpoints) {
                if (zwInput.isConnected) {
                    state.compilationString +=
                        this._declareOutput(v4Output, state) +
                            " = vec4(".concat(xInput.isConnected ? this._writeVariable(xInput) : "0.0", ", ").concat(yInput.isConnected ? this._writeVariable(yInput) : "0.0", ", ").concat(zwInput.associatedVariableName, ")").concat(this._buildSwizzle(4), ";\r\n");
                }
                else {
                    state.compilationString +=
                        this._declareOutput(v4Output, state) +
                            " = vec4(".concat(xInput.isConnected ? this._writeVariable(xInput) : "0.0", ", ").concat(yInput.isConnected ? this._writeVariable(yInput) : "0.0", ", ").concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ", ").concat(wInput.isConnected ? this._writeVariable(wInput) : "0.0", ")").concat(this._buildSwizzle(4), ";\r\n");
                }
            }
            if (v3Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(v3Output, state) +
                        " = vec3(".concat(xInput.isConnected ? this._writeVariable(xInput) : "0.0", ", ").concat(yInput.isConnected ? this._writeVariable(yInput) : "0.0", ", ").concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ")").concat(this._buildSwizzle(3), ";\r\n");
            }
            if (v2Output.hasEndpoints) {
                state.compilationString +=
                    this._declareOutput(v2Output, state) +
                        " = vec2(".concat(xInput.isConnected ? this._writeVariable(xInput) : "0.0", ", ").concat(yInput.isConnected ? this._writeVariable(yInput) : "0.0", ")").concat(this._buildSwizzle(2), ";\r\n");
            }
            if (v2CompOutput.hasEndpoints) {
                if (zwInput.isConnected) {
                    state.compilationString += this._declareOutput(v2CompOutput, state) + " = ".concat(zwInput.associatedVariableName).concat(this._buildSwizzle(2), ";\r\n");
                }
                else {
                    state.compilationString +=
                        this._declareOutput(v2CompOutput, state) +
                            " = vec2(".concat(zInput.isConnected ? this._writeVariable(zInput) : "0.0", ", ").concat(wInput.isConnected ? this._writeVariable(wInput) : "0.0", ")").concat(this._buildSwizzle(2), ";\r\n");
                }
            }
        }
        return this;
    };
    VectorMergerBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.xSwizzle = this.xSwizzle;
        serializationObject.ySwizzle = this.ySwizzle;
        serializationObject.zSwizzle = this.zSwizzle;
        serializationObject.wSwizzle = this.wSwizzle;
        return serializationObject;
    };
    VectorMergerBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a, _b, _c, _d;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.xSwizzle = (_a = serializationObject.xSwizzle) !== null && _a !== void 0 ? _a : "x";
        this.ySwizzle = (_b = serializationObject.ySwizzle) !== null && _b !== void 0 ? _b : "y";
        this.zSwizzle = (_c = serializationObject.zSwizzle) !== null && _c !== void 0 ? _c : "z";
        this.wSwizzle = (_d = serializationObject.wSwizzle) !== null && _d !== void 0 ? _d : "w";
    };
    VectorMergerBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".xSwizzle = \"").concat(this.xSwizzle, "\";\r\n");
        codeString += "".concat(this._codeVariableName, ".ySwizzle = \"").concat(this.ySwizzle, "\";\r\n");
        codeString += "".concat(this._codeVariableName, ".zSwizzle = \"").concat(this.zSwizzle, "\";\r\n");
        codeString += "".concat(this._codeVariableName, ".wSwizzle = \"").concat(this.wSwizzle, "\";\r\n");
        return codeString;
    };
    return VectorMergerBlock;
}(NodeMaterialBlock));
export { VectorMergerBlock };
RegisterClass("BABYLON.VectorMergerBlock", VectorMergerBlock);
//# sourceMappingURL=vectorMergerBlock.js.map
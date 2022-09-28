import { NodeMaterialBlockConnectionPointTypes } from "./Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "./Enums/nodeMaterialBlockTargets.js";
import { Effect } from "../effect.js";
import { StartsWith } from "../../Misc/stringTools.js";
/**
 * Class used to store node based material build state
 */
var NodeMaterialBuildState = /** @class */ (function () {
    function NodeMaterialBuildState() {
        /** Gets or sets a boolean indicating if the current state can emit uniform buffers */
        this.supportUniformBuffers = false;
        /**
         * Gets the list of emitted attributes
         */
        this.attributes = new Array();
        /**
         * Gets the list of emitted uniforms
         */
        this.uniforms = new Array();
        /**
         * Gets the list of emitted constants
         */
        this.constants = new Array();
        /**
         * Gets the list of emitted samplers
         */
        this.samplers = new Array();
        /**
         * Gets the list of emitted functions
         */
        this.functions = {};
        /**
         * Gets the list of emitted extensions
         */
        this.extensions = {};
        /**
         * Gets the list of emitted counters
         */
        this.counters = {};
        /** @hidden */
        this._attributeDeclaration = "";
        /** @hidden */
        this._uniformDeclaration = "";
        /** @hidden */
        this._constantDeclaration = "";
        /** @hidden */
        this._samplerDeclaration = "";
        /** @hidden */
        this._varyingTransfer = "";
        /** @hidden */
        this._injectAtEnd = "";
        this._repeatableContentAnchorIndex = 0;
        /** @hidden */
        this._builtCompilationString = "";
        /**
         * Gets the emitted compilation strings
         */
        this.compilationString = "";
    }
    /**
     * Finalize the compilation strings
     * @param state defines the current compilation state
     */
    NodeMaterialBuildState.prototype.finalize = function (state) {
        var emitComments = state.sharedData.emitComments;
        var isFragmentMode = this.target === NodeMaterialBlockTargets.Fragment;
        this.compilationString = "\r\n".concat(emitComments ? "//Entry point\r\n" : "", "void main(void) {\r\n").concat(this.compilationString);
        if (this._constantDeclaration) {
            this.compilationString = "\r\n".concat(emitComments ? "//Constants\r\n" : "").concat(this._constantDeclaration, "\r\n").concat(this.compilationString);
        }
        var functionCode = "";
        for (var functionName in this.functions) {
            functionCode += this.functions[functionName] + "\r\n";
        }
        this.compilationString = "\r\n".concat(functionCode, "\r\n").concat(this.compilationString);
        if (!isFragmentMode && this._varyingTransfer) {
            this.compilationString = "".concat(this.compilationString, "\r\n").concat(this._varyingTransfer);
        }
        if (this._injectAtEnd) {
            this.compilationString = "".concat(this.compilationString, "\r\n").concat(this._injectAtEnd);
        }
        this.compilationString = "".concat(this.compilationString, "\r\n}");
        if (this.sharedData.varyingDeclaration) {
            this.compilationString = "\r\n".concat(emitComments ? "//Varyings\r\n" : "").concat(this.sharedData.varyingDeclaration, "\r\n").concat(this.compilationString);
        }
        if (this._samplerDeclaration) {
            this.compilationString = "\r\n".concat(emitComments ? "//Samplers\r\n" : "").concat(this._samplerDeclaration, "\r\n").concat(this.compilationString);
        }
        if (this._uniformDeclaration) {
            this.compilationString = "\r\n".concat(emitComments ? "//Uniforms\r\n" : "").concat(this._uniformDeclaration, "\r\n").concat(this.compilationString);
        }
        if (this._attributeDeclaration && !isFragmentMode) {
            this.compilationString = "\r\n".concat(emitComments ? "//Attributes\r\n" : "").concat(this._attributeDeclaration, "\r\n").concat(this.compilationString);
        }
        this.compilationString = "precision highp float;\r\n" + this.compilationString;
        for (var extensionName in this.extensions) {
            var extension = this.extensions[extensionName];
            this.compilationString = "\r\n".concat(extension, "\r\n").concat(this.compilationString);
        }
        this._builtCompilationString = this.compilationString;
    };
    Object.defineProperty(NodeMaterialBuildState.prototype, "_repeatableContentAnchor", {
        /** @hidden */
        get: function () {
            return "###___ANCHOR".concat(this._repeatableContentAnchorIndex++, "___###");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param prefix
     * @hidden
     */
    NodeMaterialBuildState.prototype._getFreeVariableName = function (prefix) {
        prefix = prefix.replace(/[^a-zA-Z_]+/g, "");
        if (this.sharedData.variableNames[prefix] === undefined) {
            this.sharedData.variableNames[prefix] = 0;
            // Check reserved words
            if (prefix === "output" || prefix === "texture") {
                return prefix + this.sharedData.variableNames[prefix];
            }
            return prefix;
        }
        else {
            this.sharedData.variableNames[prefix]++;
        }
        return prefix + this.sharedData.variableNames[prefix];
    };
    /**
     * @param prefix
     * @hidden
     */
    NodeMaterialBuildState.prototype._getFreeDefineName = function (prefix) {
        if (this.sharedData.defineNames[prefix] === undefined) {
            this.sharedData.defineNames[prefix] = 0;
        }
        else {
            this.sharedData.defineNames[prefix]++;
        }
        return prefix + this.sharedData.defineNames[prefix];
    };
    /**
     * @param name
     * @hidden
     */
    NodeMaterialBuildState.prototype._excludeVariableName = function (name) {
        this.sharedData.variableNames[name] = 0;
    };
    /**
     * @param name
     * @hidden
     */
    NodeMaterialBuildState.prototype._emit2DSampler = function (name) {
        if (this.samplers.indexOf(name) < 0) {
            this._samplerDeclaration += "uniform sampler2D ".concat(name, ";\r\n");
            this.samplers.push(name);
        }
    };
    /**
     * @param type
     * @hidden
     */
    NodeMaterialBuildState.prototype._getGLType = function (type) {
        switch (type) {
            case NodeMaterialBlockConnectionPointTypes.Float:
                return "float";
            case NodeMaterialBlockConnectionPointTypes.Int:
                return "int";
            case NodeMaterialBlockConnectionPointTypes.Vector2:
                return "vec2";
            case NodeMaterialBlockConnectionPointTypes.Color3:
            case NodeMaterialBlockConnectionPointTypes.Vector3:
                return "vec3";
            case NodeMaterialBlockConnectionPointTypes.Color4:
            case NodeMaterialBlockConnectionPointTypes.Vector4:
                return "vec4";
            case NodeMaterialBlockConnectionPointTypes.Matrix:
                return "mat4";
        }
        return "";
    };
    /**
     * @param name
     * @param extension
     * @param define
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitExtension = function (name, extension, define) {
        if (define === void 0) { define = ""; }
        if (this.extensions[name]) {
            return;
        }
        if (define) {
            extension = "#if ".concat(define, "\r\n").concat(extension, "\r\n#endif");
        }
        this.extensions[name] = extension;
    };
    /**
     * @param name
     * @param code
     * @param comments
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitFunction = function (name, code, comments) {
        if (this.functions[name]) {
            return;
        }
        if (this.sharedData.emitComments) {
            code = comments + "\r\n" + code;
        }
        this.functions[name] = code;
    };
    /**
     * @param includeName
     * @param comments
     * @param options
     * @param options.replaceStrings
     * @param options.repeatKey
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitCodeFromInclude = function (includeName, comments, options) {
        if (options && options.repeatKey) {
            return "#include<".concat(includeName, ">[0..").concat(options.repeatKey, "]\r\n");
        }
        var code = Effect.IncludesShadersStore[includeName] + "\r\n";
        if (this.sharedData.emitComments) {
            code = comments + "\r\n" + code;
        }
        if (!options) {
            return code;
        }
        if (options.replaceStrings) {
            for (var index = 0; index < options.replaceStrings.length; index++) {
                var replaceString = options.replaceStrings[index];
                code = code.replace(replaceString.search, replaceString.replace);
            }
        }
        return code;
    };
    /**
     * @param includeName
     * @param comments
     * @param options
     * @param options.repeatKey
     * @param options.removeAttributes
     * @param options.removeUniforms
     * @param options.removeVaryings
     * @param options.removeIfDef
     * @param options.replaceStrings
     * @param storeKey
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitFunctionFromInclude = function (includeName, comments, options, storeKey) {
        if (storeKey === void 0) { storeKey = ""; }
        var key = includeName + storeKey;
        if (this.functions[key]) {
            return;
        }
        if (!options || (!options.removeAttributes && !options.removeUniforms && !options.removeVaryings && !options.removeIfDef && !options.replaceStrings)) {
            if (options && options.repeatKey) {
                this.functions[key] = "#include<".concat(includeName, ">[0..").concat(options.repeatKey, "]\r\n");
            }
            else {
                this.functions[key] = "#include<".concat(includeName, ">\r\n");
            }
            if (this.sharedData.emitComments) {
                this.functions[key] = comments + "\r\n" + this.functions[key];
            }
            return;
        }
        this.functions[key] = Effect.IncludesShadersStore[includeName];
        if (this.sharedData.emitComments) {
            this.functions[key] = comments + "\r\n" + this.functions[key];
        }
        if (options.removeIfDef) {
            this.functions[key] = this.functions[key].replace(/^\s*?#ifdef.+$/gm, "");
            this.functions[key] = this.functions[key].replace(/^\s*?#endif.*$/gm, "");
            this.functions[key] = this.functions[key].replace(/^\s*?#else.*$/gm, "");
            this.functions[key] = this.functions[key].replace(/^\s*?#elif.*$/gm, "");
        }
        if (options.removeAttributes) {
            this.functions[key] = this.functions[key].replace(/^\s*?attribute.+$/gm, "");
        }
        if (options.removeUniforms) {
            this.functions[key] = this.functions[key].replace(/^\s*?uniform.+$/gm, "");
        }
        if (options.removeVaryings) {
            this.functions[key] = this.functions[key].replace(/^\s*?varying.+$/gm, "");
        }
        if (options.replaceStrings) {
            for (var index = 0; index < options.replaceStrings.length; index++) {
                var replaceString = options.replaceStrings[index];
                this.functions[key] = this.functions[key].replace(replaceString.search, replaceString.replace);
            }
        }
    };
    /**
     * @param name
     * @hidden
     */
    NodeMaterialBuildState.prototype._registerTempVariable = function (name) {
        if (this.sharedData.temps.indexOf(name) !== -1) {
            return false;
        }
        this.sharedData.temps.push(name);
        return true;
    };
    /**
     * @param name
     * @param type
     * @param define
     * @param notDefine
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitVaryingFromString = function (name, type, define, notDefine) {
        if (define === void 0) { define = ""; }
        if (notDefine === void 0) { notDefine = false; }
        if (this.sharedData.varyings.indexOf(name) !== -1) {
            return false;
        }
        this.sharedData.varyings.push(name);
        if (define) {
            if (StartsWith(define, "defined(")) {
                this.sharedData.varyingDeclaration += "#if ".concat(define, "\r\n");
            }
            else {
                this.sharedData.varyingDeclaration += "".concat(notDefine ? "#ifndef" : "#ifdef", " ").concat(define, "\r\n");
            }
        }
        this.sharedData.varyingDeclaration += "varying ".concat(type, " ").concat(name, ";\r\n");
        if (define) {
            this.sharedData.varyingDeclaration += "#endif\r\n";
        }
        return true;
    };
    /**
     * @param name
     * @param type
     * @param define
     * @param notDefine
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitUniformFromString = function (name, type, define, notDefine) {
        if (define === void 0) { define = ""; }
        if (notDefine === void 0) { notDefine = false; }
        if (this.uniforms.indexOf(name) !== -1) {
            return;
        }
        this.uniforms.push(name);
        if (define) {
            if (StartsWith(define, "defined(")) {
                this._uniformDeclaration += "#if ".concat(define, "\r\n");
            }
            else {
                this._uniformDeclaration += "".concat(notDefine ? "#ifndef" : "#ifdef", " ").concat(define, "\r\n");
            }
        }
        this._uniformDeclaration += "uniform ".concat(type, " ").concat(name, ";\r\n");
        if (define) {
            this._uniformDeclaration += "#endif\r\n";
        }
    };
    /**
     * @param value
     * @hidden
     */
    NodeMaterialBuildState.prototype._emitFloat = function (value) {
        if (value.toString() === value.toFixed(0)) {
            return "".concat(value, ".0");
        }
        return value.toString();
    };
    return NodeMaterialBuildState;
}());
export { NodeMaterialBuildState };
//# sourceMappingURL=nodeMaterialBuildState.js.map
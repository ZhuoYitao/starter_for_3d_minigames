import { EscapeRegExp, ExtractBetweenMarkers, FindBackward, IsIdentifierChar, RemoveComments, SkipWhitespaces } from "../../Misc/codeStringParsingTools.js";
/**
 * Class used to inline functions in shader code
 */
var ShaderCodeInliner = /** @class */ (function () {
    /**
     * Initializes the inliner
     * @param sourceCode shader code source to inline
     * @param numMaxIterations maximum number of iterations (used to detect recursive calls)
     */
    function ShaderCodeInliner(sourceCode, numMaxIterations) {
        if (numMaxIterations === void 0) { numMaxIterations = 20; }
        /** Gets or sets the debug mode */
        this.debug = false;
        this._sourceCode = sourceCode;
        this._numMaxIterations = numMaxIterations;
        this._functionDescr = [];
        this.inlineToken = "#define inline";
    }
    Object.defineProperty(ShaderCodeInliner.prototype, "code", {
        /** Gets the code after the inlining process */
        get: function () {
            return this._sourceCode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Start the processing of the shader code
     */
    ShaderCodeInliner.prototype.processCode = function () {
        if (this.debug) {
            console.log("Start inlining process (code size=".concat(this._sourceCode.length, ")..."));
        }
        this._collectFunctions();
        this._processInlining(this._numMaxIterations);
        if (this.debug) {
            console.log("End of inlining process.");
        }
    };
    ShaderCodeInliner.prototype._collectFunctions = function () {
        var startIndex = 0;
        while (startIndex < this._sourceCode.length) {
            // locate the function to inline and extract its name
            var inlineTokenIndex = this._sourceCode.indexOf(this.inlineToken, startIndex);
            if (inlineTokenIndex < 0) {
                break;
            }
            var funcParamsStartIndex = this._sourceCode.indexOf("(", inlineTokenIndex + this.inlineToken.length);
            if (funcParamsStartIndex < 0) {
                if (this.debug) {
                    console.warn("Could not find the opening parenthesis after the token. startIndex=".concat(startIndex));
                }
                startIndex = inlineTokenIndex + this.inlineToken.length;
                continue;
            }
            var funcNameMatch = ShaderCodeInliner._RegexpFindFunctionNameAndType.exec(this._sourceCode.substring(inlineTokenIndex + this.inlineToken.length, funcParamsStartIndex));
            if (!funcNameMatch) {
                if (this.debug) {
                    console.warn("Could not extract the name/type of the function from: ".concat(this._sourceCode.substring(inlineTokenIndex + this.inlineToken.length, funcParamsStartIndex)));
                }
                startIndex = inlineTokenIndex + this.inlineToken.length;
                continue;
            }
            var _a = [funcNameMatch[3], funcNameMatch[4]], funcType = _a[0], funcName = _a[1];
            // extract the parameters of the function as a whole string (without the leading / trailing parenthesis)
            var funcParamsEndIndex = ExtractBetweenMarkers("(", ")", this._sourceCode, funcParamsStartIndex);
            if (funcParamsEndIndex < 0) {
                if (this.debug) {
                    console.warn("Could not extract the parameters the function '".concat(funcName, "' (type=").concat(funcType, "). funcParamsStartIndex=").concat(funcParamsStartIndex));
                }
                startIndex = inlineTokenIndex + this.inlineToken.length;
                continue;
            }
            var funcParams = this._sourceCode.substring(funcParamsStartIndex + 1, funcParamsEndIndex);
            // extract the body of the function (with the curly brackets)
            var funcBodyStartIndex = SkipWhitespaces(this._sourceCode, funcParamsEndIndex + 1);
            if (funcBodyStartIndex === this._sourceCode.length) {
                if (this.debug) {
                    console.warn("Could not extract the body of the function '".concat(funcName, "' (type=").concat(funcType, "). funcParamsEndIndex=").concat(funcParamsEndIndex));
                }
                startIndex = inlineTokenIndex + this.inlineToken.length;
                continue;
            }
            var funcBodyEndIndex = ExtractBetweenMarkers("{", "}", this._sourceCode, funcBodyStartIndex);
            if (funcBodyEndIndex < 0) {
                if (this.debug) {
                    console.warn("Could not extract the body of the function '".concat(funcName, "' (type=").concat(funcType, "). funcBodyStartIndex=").concat(funcBodyStartIndex));
                }
                startIndex = inlineTokenIndex + this.inlineToken.length;
                continue;
            }
            var funcBody = this._sourceCode.substring(funcBodyStartIndex, funcBodyEndIndex + 1);
            // process the parameters: extract each names
            var params = RemoveComments(funcParams).split(",");
            var paramNames = [];
            for (var p = 0; p < params.length; ++p) {
                var param = params[p].trim();
                var idx = param.lastIndexOf(" ");
                if (idx >= 0) {
                    paramNames.push(param.substring(idx + 1));
                }
            }
            if (funcType !== "void") {
                // for functions that return a value, we will replace "return" by "tempvarname = ", tempvarname being a unique generated name
                paramNames.push("return");
            }
            // collect the function
            this._functionDescr.push({
                name: funcName,
                type: funcType,
                parameters: paramNames,
                body: funcBody,
                callIndex: 0,
            });
            startIndex = funcBodyEndIndex + 1;
            // remove the function from the source code
            var partBefore = inlineTokenIndex > 0 ? this._sourceCode.substring(0, inlineTokenIndex) : "";
            var partAfter = funcBodyEndIndex + 1 < this._sourceCode.length - 1 ? this._sourceCode.substring(funcBodyEndIndex + 1) : "";
            this._sourceCode = partBefore + partAfter;
            startIndex -= funcBodyEndIndex + 1 - inlineTokenIndex;
        }
        if (this.debug) {
            console.log("Collect functions: ".concat(this._functionDescr.length, " functions found. functionDescr="), this._functionDescr);
        }
    };
    ShaderCodeInliner.prototype._processInlining = function (numMaxIterations) {
        if (numMaxIterations === void 0) { numMaxIterations = 20; }
        while (numMaxIterations-- >= 0) {
            if (!this._replaceFunctionCallsByCode()) {
                break;
            }
        }
        if (this.debug) {
            console.log("numMaxIterations is ".concat(numMaxIterations, " after inlining process"));
        }
        return numMaxIterations >= 0;
    };
    ShaderCodeInliner.prototype._replaceFunctionCallsByCode = function () {
        var doAgain = false;
        for (var _i = 0, _a = this._functionDescr; _i < _a.length; _i++) {
            var func = _a[_i];
            var name_1 = func.name, type = func.type, parameters = func.parameters, body = func.body;
            var startIndex = 0;
            while (startIndex < this._sourceCode.length) {
                // Look for the function name in the source code
                var functionCallIndex = this._sourceCode.indexOf(name_1, startIndex);
                if (functionCallIndex < 0) {
                    break;
                }
                // Make sure "name" is not part of a bigger string
                if (functionCallIndex === 0 || IsIdentifierChar(this._sourceCode.charAt(functionCallIndex - 1))) {
                    startIndex = functionCallIndex + name_1.length;
                    continue;
                }
                // Find the opening parenthesis
                var callParamsStartIndex = SkipWhitespaces(this._sourceCode, functionCallIndex + name_1.length);
                if (callParamsStartIndex === this._sourceCode.length || this._sourceCode.charAt(callParamsStartIndex) !== "(") {
                    startIndex = functionCallIndex + name_1.length;
                    continue;
                }
                // extract the parameters of the function call as a whole string (without the leading / trailing parenthesis)
                var callParamsEndIndex = ExtractBetweenMarkers("(", ")", this._sourceCode, callParamsStartIndex);
                if (callParamsEndIndex < 0) {
                    if (this.debug) {
                        console.warn("Could not extract the parameters of the function call. Function '".concat(name_1, "' (type=").concat(type, "). callParamsStartIndex=").concat(callParamsStartIndex));
                    }
                    startIndex = functionCallIndex + name_1.length;
                    continue;
                }
                var callParams = this._sourceCode.substring(callParamsStartIndex + 1, callParamsEndIndex);
                // process the parameter call: extract each names
                // this function split the parameter list used in the function call at ',' boundaries by taking care of potential parenthesis like in:
                //      myfunc(a, vec2(1., 0.), 4.)
                var splitParameterCall = function (s) {
                    var parameters = [];
                    var curIdx = 0, startParamIdx = 0;
                    while (curIdx < s.length) {
                        if (s.charAt(curIdx) === "(") {
                            var idx2 = ExtractBetweenMarkers("(", ")", s, curIdx);
                            if (idx2 < 0) {
                                return null;
                            }
                            curIdx = idx2;
                        }
                        else if (s.charAt(curIdx) === ",") {
                            parameters.push(s.substring(startParamIdx, curIdx));
                            startParamIdx = curIdx + 1;
                        }
                        curIdx++;
                    }
                    if (startParamIdx < curIdx) {
                        parameters.push(s.substring(startParamIdx, curIdx));
                    }
                    return parameters;
                };
                var params = splitParameterCall(RemoveComments(callParams));
                if (params === null) {
                    if (this.debug) {
                        console.warn("Invalid function call: can't extract the parameters of the function call. Function '".concat(name_1, "' (type=").concat(type, "). callParamsStartIndex=").concat(callParamsStartIndex, ", callParams=") +
                            callParams);
                    }
                    startIndex = functionCallIndex + name_1.length;
                    continue;
                }
                var paramNames = [];
                for (var p = 0; p < params.length; ++p) {
                    var param = params[p].trim();
                    paramNames.push(param);
                }
                var retParamName = type !== "void" ? name_1 + "_" + func.callIndex++ : null;
                if (retParamName) {
                    paramNames.push(retParamName + " =");
                }
                if (paramNames.length !== parameters.length) {
                    if (this.debug) {
                        console.warn("Invalid function call: not the same number of parameters for the call than the number expected by the function. Function '".concat(name_1, "' (type=").concat(type, "). function parameters=").concat(parameters, ", call parameters=").concat(paramNames));
                    }
                    startIndex = functionCallIndex + name_1.length;
                    continue;
                }
                startIndex = callParamsEndIndex + 1;
                // replace the function call by the body function
                var funcBody = this._replaceNames(body, parameters, paramNames);
                var partBefore = functionCallIndex > 0 ? this._sourceCode.substring(0, functionCallIndex) : "";
                var partAfter = callParamsEndIndex + 1 < this._sourceCode.length - 1 ? this._sourceCode.substring(callParamsEndIndex + 1) : "";
                if (retParamName) {
                    // case where the function returns a value. We generate:
                    // FUNCTYPE retParamName;
                    // {function body}
                    // and replace the function call by retParamName
                    var injectDeclarationIndex = FindBackward(this._sourceCode, functionCallIndex - 1, "\n");
                    partBefore = this._sourceCode.substring(0, injectDeclarationIndex + 1);
                    var partBetween = this._sourceCode.substring(injectDeclarationIndex + 1, functionCallIndex);
                    this._sourceCode = partBefore + type + " " + retParamName + ";\n" + funcBody + "\n" + partBetween + retParamName + partAfter;
                    if (this.debug) {
                        console.log("Replace function call by code. Function '".concat(name_1, "' (type=").concat(type, "). injectDeclarationIndex=").concat(injectDeclarationIndex, ", call parameters=").concat(paramNames));
                    }
                }
                else {
                    // simple case where the return value of the function is "void"
                    this._sourceCode = partBefore + funcBody + partAfter;
                    startIndex += funcBody.length - (callParamsEndIndex + 1 - functionCallIndex);
                    if (this.debug) {
                        console.log("Replace function call by code. Function '".concat(name_1, "' (type=").concat(type, "). functionCallIndex=").concat(functionCallIndex, ", call parameters=").concat(paramNames));
                    }
                }
                doAgain = true;
            }
        }
        return doAgain;
    };
    ShaderCodeInliner.prototype._replaceNames = function (code, sources, destinations) {
        var _loop_1 = function (i) {
            var source = new RegExp(EscapeRegExp(sources[i]), "g"), sourceLen = sources[i].length, destination = destinations[i];
            code = code.replace(source, function (match) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var offset = args[0];
                // Make sure "source" is not part of a bigger identifier (for eg, if source=view and we matched it with viewDirection)
                if (IsIdentifierChar(code.charAt(offset - 1)) || IsIdentifierChar(code.charAt(offset + sourceLen))) {
                    return sources[i];
                }
                return destination;
            });
        };
        for (var i = 0; i < sources.length; ++i) {
            _loop_1(i);
        }
        return code;
    };
    ShaderCodeInliner._RegexpFindFunctionNameAndType = /((\s+?)(\w+)\s+(\w+)\s*?)$/;
    return ShaderCodeInliner;
}());
export { ShaderCodeInliner };
//# sourceMappingURL=shaderCodeInliner.js.map
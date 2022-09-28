/* eslint-disable @typescript-eslint/no-unused-vars */
import { ShaderCodeNode } from "./shaderCodeNode.js";
import { ShaderCodeCursor } from "./shaderCodeCursor.js";
import { ShaderCodeConditionNode } from "./shaderCodeConditionNode.js";
import { ShaderCodeTestNode } from "./shaderCodeTestNode.js";
import { ShaderDefineIsDefinedOperator } from "./Expressions/Operators/shaderDefineIsDefinedOperator.js";
import { ShaderDefineOrOperator } from "./Expressions/Operators/shaderDefineOrOperator.js";
import { ShaderDefineAndOperator } from "./Expressions/Operators/shaderDefineAndOperator.js";
import { ShaderDefineExpression } from "./Expressions/shaderDefineExpression.js";
import { ShaderDefineArithmeticOperator } from "./Expressions/Operators/shaderDefineArithmeticOperator.js";
import { _WarnImport } from "../../Misc/devTools.js";
import { ShaderLanguage } from "../../Materials/shaderLanguage.js";
var regexSE = /defined\s*?\((.+?)\)/g;
var regexSERevert = /defined\s*?\[(.+?)\]/g;
var regexShaderInclude = /#include\s?<(.+)>(\((.*)\))*(\[(.*)\])*/g;
/** @hidden */
var ShaderProcessor = /** @class */ (function () {
    function ShaderProcessor() {
    }
    ShaderProcessor.Initialize = function (options) {
        if (options.processor && options.processor.initializeShaders) {
            options.processor.initializeShaders(options.processingContext);
        }
    };
    ShaderProcessor.Process = function (sourceCode, options, callback, engine) {
        var _this = this;
        var _a;
        if ((_a = options.processor) === null || _a === void 0 ? void 0 : _a.preProcessShaderCode) {
            sourceCode = options.processor.preProcessShaderCode(sourceCode, options.isFragment);
        }
        this._ProcessIncludes(sourceCode, options, function (codeWithIncludes) {
            if (options.processCodeAfterIncludes) {
                codeWithIncludes = options.processCodeAfterIncludes(options.isFragment ? "fragment" : "vertex", codeWithIncludes);
            }
            var migratedCode = _this._ProcessShaderConversion(codeWithIncludes, options, engine);
            callback(migratedCode);
        });
    };
    ShaderProcessor.PreProcess = function (sourceCode, options, callback, engine) {
        var _this = this;
        var _a;
        if ((_a = options.processor) === null || _a === void 0 ? void 0 : _a.preProcessShaderCode) {
            sourceCode = options.processor.preProcessShaderCode(sourceCode, options.isFragment);
        }
        this._ProcessIncludes(sourceCode, options, function (codeWithIncludes) {
            if (options.processCodeAfterIncludes) {
                codeWithIncludes = options.processCodeAfterIncludes(options.isFragment ? "fragment" : "vertex", codeWithIncludes);
            }
            var migratedCode = _this._ApplyPreProcessing(codeWithIncludes, options, engine);
            callback(migratedCode);
        });
    };
    ShaderProcessor.Finalize = function (vertexCode, fragmentCode, options) {
        if (!options.processor || !options.processor.finalizeShaders) {
            return { vertexCode: vertexCode, fragmentCode: fragmentCode };
        }
        return options.processor.finalizeShaders(vertexCode, fragmentCode, options.processingContext);
    };
    ShaderProcessor._ProcessPrecision = function (source, options) {
        var _a;
        if ((_a = options.processor) === null || _a === void 0 ? void 0 : _a.noPrecision) {
            return source;
        }
        var shouldUseHighPrecisionShader = options.shouldUseHighPrecisionShader;
        if (source.indexOf("precision highp float") === -1) {
            if (!shouldUseHighPrecisionShader) {
                source = "precision mediump float;\n" + source;
            }
            else {
                source = "precision highp float;\n" + source;
            }
        }
        else {
            if (!shouldUseHighPrecisionShader) {
                // Moving highp to mediump
                source = source.replace("precision highp float", "precision mediump float");
            }
        }
        return source;
    };
    ShaderProcessor._ExtractOperation = function (expression) {
        var regex = /defined\((.+)\)/;
        var match = regex.exec(expression);
        if (match && match.length) {
            return new ShaderDefineIsDefinedOperator(match[1].trim(), expression[0] === "!");
        }
        var operators = ["==", ">=", "<=", "<", ">"];
        var operator = "";
        var indexOperator = 0;
        for (var _i = 0, operators_1 = operators; _i < operators_1.length; _i++) {
            operator = operators_1[_i];
            indexOperator = expression.indexOf(operator);
            if (indexOperator > -1) {
                break;
            }
        }
        if (indexOperator === -1) {
            return new ShaderDefineIsDefinedOperator(expression);
        }
        var define = expression.substring(0, indexOperator).trim();
        var value = expression.substring(indexOperator + operator.length).trim();
        return new ShaderDefineArithmeticOperator(define, operator, value);
    };
    ShaderProcessor._BuildSubExpression = function (expression) {
        expression = expression.replace(regexSE, "defined[$1]");
        var postfix = ShaderDefineExpression.infixToPostfix(expression);
        var stack = [];
        for (var _i = 0, postfix_1 = postfix; _i < postfix_1.length; _i++) {
            var c = postfix_1[_i];
            if (c !== "||" && c !== "&&") {
                stack.push(c);
            }
            else if (stack.length >= 2) {
                var v1 = stack[stack.length - 1], v2 = stack[stack.length - 2];
                stack.length -= 2;
                var operator = c == "&&" ? new ShaderDefineAndOperator() : new ShaderDefineOrOperator();
                if (typeof v1 === "string") {
                    v1 = v1.replace(regexSERevert, "defined($1)");
                }
                if (typeof v2 === "string") {
                    v2 = v2.replace(regexSERevert, "defined($1)");
                }
                operator.leftOperand = typeof v2 === "string" ? this._ExtractOperation(v2) : v2;
                operator.rightOperand = typeof v1 === "string" ? this._ExtractOperation(v1) : v1;
                stack.push(operator);
            }
        }
        var result = stack[stack.length - 1];
        if (typeof result === "string") {
            result = result.replace(regexSERevert, "defined($1)");
        }
        // note: stack.length !== 1 if there was an error in the parsing
        return typeof result === "string" ? this._ExtractOperation(result) : result;
    };
    ShaderProcessor._BuildExpression = function (line, start) {
        var node = new ShaderCodeTestNode();
        var command = line.substring(0, start);
        var expression = line.substring(start);
        expression = expression.substring(0, (expression.indexOf("//") + 1 || expression.length + 1) - 1).trim();
        if (command === "#ifdef") {
            node.testExpression = new ShaderDefineIsDefinedOperator(expression);
        }
        else if (command === "#ifndef") {
            node.testExpression = new ShaderDefineIsDefinedOperator(expression, true);
        }
        else {
            node.testExpression = this._BuildSubExpression(expression);
        }
        return node;
    };
    ShaderProcessor._MoveCursorWithinIf = function (cursor, rootNode, ifNode) {
        var line = cursor.currentLine;
        while (this._MoveCursor(cursor, ifNode)) {
            line = cursor.currentLine;
            var first5 = line.substring(0, 5).toLowerCase();
            if (first5 === "#else") {
                var elseNode = new ShaderCodeNode();
                rootNode.children.push(elseNode);
                this._MoveCursor(cursor, elseNode);
                return;
            }
            else if (first5 === "#elif") {
                var elifNode = this._BuildExpression(line, 5);
                rootNode.children.push(elifNode);
                ifNode = elifNode;
            }
        }
    };
    ShaderProcessor._MoveCursor = function (cursor, rootNode) {
        while (cursor.canRead) {
            cursor.lineIndex++;
            var line = cursor.currentLine;
            var keywords = /(#ifdef)|(#else)|(#elif)|(#endif)|(#ifndef)|(#if)/;
            var matches = keywords.exec(line);
            if (matches && matches.length) {
                var keyword = matches[0];
                switch (keyword) {
                    case "#ifdef": {
                        var newRootNode = new ShaderCodeConditionNode();
                        rootNode.children.push(newRootNode);
                        var ifNode = this._BuildExpression(line, 6);
                        newRootNode.children.push(ifNode);
                        this._MoveCursorWithinIf(cursor, newRootNode, ifNode);
                        break;
                    }
                    case "#else":
                    case "#elif":
                        return true;
                    case "#endif":
                        return false;
                    case "#ifndef": {
                        var newRootNode = new ShaderCodeConditionNode();
                        rootNode.children.push(newRootNode);
                        var ifNode = this._BuildExpression(line, 7);
                        newRootNode.children.push(ifNode);
                        this._MoveCursorWithinIf(cursor, newRootNode, ifNode);
                        break;
                    }
                    case "#if": {
                        var newRootNode = new ShaderCodeConditionNode();
                        var ifNode = this._BuildExpression(line, 3);
                        rootNode.children.push(newRootNode);
                        newRootNode.children.push(ifNode);
                        this._MoveCursorWithinIf(cursor, newRootNode, ifNode);
                        break;
                    }
                }
            }
            else {
                var newNode = new ShaderCodeNode();
                newNode.line = line;
                rootNode.children.push(newNode);
                // Detect additional defines
                if (line[0] === "#" && line[1] === "d") {
                    var split = line.replace(";", "").split(" ");
                    newNode.additionalDefineKey = split[1];
                    if (split.length === 3) {
                        newNode.additionalDefineValue = split[2];
                    }
                }
            }
        }
        return false;
    };
    ShaderProcessor._EvaluatePreProcessors = function (sourceCode, preprocessors, options) {
        var rootNode = new ShaderCodeNode();
        var cursor = new ShaderCodeCursor();
        cursor.lineIndex = -1;
        cursor.lines = sourceCode.split("\n");
        // Decompose (We keep it in 2 steps so it is easier to maintain and perf hit is insignificant)
        this._MoveCursor(cursor, rootNode);
        // Recompose
        return rootNode.process(preprocessors, options);
    };
    ShaderProcessor._PreparePreProcessors = function (options, engine) {
        var _a;
        var defines = options.defines;
        var preprocessors = {};
        for (var _i = 0, defines_1 = defines; _i < defines_1.length; _i++) {
            var define = defines_1[_i];
            var keyValue = define.replace("#define", "").replace(";", "").trim();
            var split = keyValue.split(" ");
            preprocessors[split[0]] = split.length > 1 ? split[1] : "";
        }
        if (((_a = options.processor) === null || _a === void 0 ? void 0 : _a.shaderLanguage) === ShaderLanguage.GLSL) {
            preprocessors["GL_ES"] = "true";
        }
        preprocessors["__VERSION__"] = options.version;
        preprocessors[options.platformName] = "true";
        engine._getGlobalDefines(preprocessors);
        return preprocessors;
    };
    ShaderProcessor._ProcessShaderConversion = function (sourceCode, options, engine) {
        var preparedSourceCode = this._ProcessPrecision(sourceCode, options);
        if (!options.processor) {
            return preparedSourceCode;
        }
        // Already converted
        if (options.processor.shaderLanguage === ShaderLanguage.GLSL && preparedSourceCode.indexOf("#version 3") !== -1) {
            return preparedSourceCode.replace("#version 300 es", "");
        }
        var defines = options.defines;
        var preprocessors = this._PreparePreProcessors(options, engine);
        // General pre processing
        if (options.processor.preProcessor) {
            preparedSourceCode = options.processor.preProcessor(preparedSourceCode, defines, options.isFragment, options.processingContext);
        }
        preparedSourceCode = this._EvaluatePreProcessors(preparedSourceCode, preprocessors, options);
        // Post processing
        if (options.processor.postProcessor) {
            preparedSourceCode = options.processor.postProcessor(preparedSourceCode, defines, options.isFragment, options.processingContext, engine);
        }
        // Inline functions tagged with #define inline
        if (engine._features.needShaderCodeInlining) {
            preparedSourceCode = engine.inlineShaderCode(preparedSourceCode);
        }
        return preparedSourceCode;
    };
    ShaderProcessor._ApplyPreProcessing = function (sourceCode, options, engine) {
        var _a, _b;
        var preparedSourceCode = sourceCode;
        var defines = options.defines;
        var preprocessors = this._PreparePreProcessors(options, engine);
        // General pre processing
        if ((_a = options.processor) === null || _a === void 0 ? void 0 : _a.preProcessor) {
            preparedSourceCode = options.processor.preProcessor(preparedSourceCode, defines, options.isFragment, options.processingContext);
        }
        preparedSourceCode = this._EvaluatePreProcessors(preparedSourceCode, preprocessors, options);
        // Post processing
        if ((_b = options.processor) === null || _b === void 0 ? void 0 : _b.postProcessor) {
            preparedSourceCode = options.processor.postProcessor(preparedSourceCode, defines, options.isFragment, options.processingContext, engine);
        }
        // Inline functions tagged with #define inline
        if (engine._features.needShaderCodeInlining) {
            preparedSourceCode = engine.inlineShaderCode(preparedSourceCode);
        }
        return preparedSourceCode;
    };
    ShaderProcessor._ProcessIncludes = function (sourceCode, options, callback) {
        var _this = this;
        var match = regexShaderInclude.exec(sourceCode);
        var returnValue = new String(sourceCode);
        var keepProcessing = false;
        var _loop_1 = function () {
            var includeFile = match[1];
            // Uniform declaration
            if (includeFile.indexOf("__decl__") !== -1) {
                includeFile = includeFile.replace(/__decl__/, "");
                if (options.supportsUniformBuffers) {
                    includeFile = includeFile.replace(/Vertex/, "Ubo");
                    includeFile = includeFile.replace(/Fragment/, "Ubo");
                }
                includeFile = includeFile + "Declaration";
            }
            if (options.includesShadersStore[includeFile]) {
                // Substitution
                var includeContent = options.includesShadersStore[includeFile];
                if (match[2]) {
                    var splits = match[3].split(",");
                    for (var index = 0; index < splits.length; index += 2) {
                        var source = new RegExp(splits[index], "g");
                        var dest = splits[index + 1];
                        includeContent = includeContent.replace(source, dest);
                    }
                }
                if (match[4]) {
                    var indexString = match[5];
                    if (indexString.indexOf("..") !== -1) {
                        var indexSplits = indexString.split("..");
                        var minIndex = parseInt(indexSplits[0]);
                        var maxIndex = parseInt(indexSplits[1]);
                        var sourceIncludeContent = includeContent.slice(0);
                        includeContent = "";
                        if (isNaN(maxIndex)) {
                            maxIndex = options.indexParameters[indexSplits[1]];
                        }
                        for (var i = minIndex; i < maxIndex; i++) {
                            if (!options.supportsUniformBuffers) {
                                // Ubo replacement
                                sourceIncludeContent = sourceIncludeContent.replace(/light\{X\}.(\w*)/g, function (str, p1) {
                                    return p1 + "{X}";
                                });
                            }
                            includeContent += sourceIncludeContent.replace(/\{X\}/g, i.toString()) + "\n";
                        }
                    }
                    else {
                        if (!options.supportsUniformBuffers) {
                            // Ubo replacement
                            includeContent = includeContent.replace(/light\{X\}.(\w*)/g, function (str, p1) {
                                return p1 + "{X}";
                            });
                        }
                        includeContent = includeContent.replace(/\{X\}/g, indexString);
                    }
                }
                // Replace
                returnValue = returnValue.replace(match[0], includeContent);
                keepProcessing = keepProcessing || includeContent.indexOf("#include<") >= 0 || includeContent.indexOf("#include <") >= 0;
            }
            else {
                var includeShaderUrl = options.shadersRepository + "ShadersInclude/" + includeFile + ".fx";
                ShaderProcessor._FileToolsLoadFile(includeShaderUrl, function (fileContent) {
                    options.includesShadersStore[includeFile] = fileContent;
                    _this._ProcessIncludes(returnValue, options, callback);
                });
                return { value: void 0 };
            }
            match = regexShaderInclude.exec(sourceCode);
        };
        while (match != null) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
        if (keepProcessing) {
            this._ProcessIncludes(returnValue.toString(), options, callback);
        }
        else {
            callback(returnValue);
        }
    };
    /**
     * Loads a file from a url
     * @param url url to load
     * @param onSuccess callback called when the file successfully loads
     * @param onProgress callback called while file is loading (if the server supports this mode)
     * @param offlineProvider defines the offline provider for caching
     * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
     * @param onError callback called when the file fails to load
     * @returns a file request object
     * @hidden
     */
    ShaderProcessor._FileToolsLoadFile = function (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError) {
        throw _WarnImport("FileTools");
    };
    return ShaderProcessor;
}());
export { ShaderProcessor };
//# sourceMappingURL=shaderProcessor.js.map
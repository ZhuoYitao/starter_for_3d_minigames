import { StartsWith } from "../../Misc/stringTools.js";
/** @hidden */
var ShaderCodeNode = /** @class */ (function () {
    function ShaderCodeNode() {
        this.children = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ShaderCodeNode.prototype.isValid = function (preprocessors) {
        return true;
    };
    ShaderCodeNode.prototype.process = function (preprocessors, options) {
        var result = "";
        if (this.line) {
            var value = this.line;
            var processor = options.processor;
            if (processor) {
                // This must be done before other replacements to avoid mistakenly changing something that was already changed.
                if (processor.lineProcessor) {
                    value = processor.lineProcessor(value, options.isFragment, options.processingContext);
                }
                if (processor.attributeProcessor && StartsWith(this.line, "attribute")) {
                    value = processor.attributeProcessor(this.line, preprocessors, options.processingContext);
                }
                else if (processor.varyingProcessor && StartsWith(this.line, "varying")) {
                    value = processor.varyingProcessor(this.line, options.isFragment, preprocessors, options.processingContext);
                }
                else if (processor.uniformProcessor && processor.uniformRegexp && processor.uniformRegexp.test(this.line)) {
                    if (!options.lookForClosingBracketForUniformBuffer) {
                        value = processor.uniformProcessor(this.line, options.isFragment, preprocessors, options.processingContext);
                    }
                }
                else if (processor.uniformBufferProcessor && processor.uniformBufferRegexp && processor.uniformBufferRegexp.test(this.line)) {
                    if (!options.lookForClosingBracketForUniformBuffer) {
                        value = processor.uniformBufferProcessor(this.line, options.isFragment, options.processingContext);
                        options.lookForClosingBracketForUniformBuffer = true;
                    }
                }
                else if (processor.textureProcessor && processor.textureRegexp && processor.textureRegexp.test(this.line)) {
                    value = processor.textureProcessor(this.line, options.isFragment, preprocessors, options.processingContext);
                }
                else if ((processor.uniformProcessor || processor.uniformBufferProcessor) && StartsWith(this.line, "uniform") && !options.lookForClosingBracketForUniformBuffer) {
                    var regex = /uniform\s+(?:(?:highp)?|(?:lowp)?)\s*(\S+)\s+(\S+)\s*;/;
                    if (regex.test(this.line)) {
                        // uniform
                        if (processor.uniformProcessor) {
                            value = processor.uniformProcessor(this.line, options.isFragment, preprocessors, options.processingContext);
                        }
                    }
                    else {
                        // Uniform buffer
                        if (processor.uniformBufferProcessor) {
                            value = processor.uniformBufferProcessor(this.line, options.isFragment, options.processingContext);
                            options.lookForClosingBracketForUniformBuffer = true;
                        }
                    }
                }
                if (options.lookForClosingBracketForUniformBuffer && this.line.indexOf("}") !== -1) {
                    options.lookForClosingBracketForUniformBuffer = false;
                    if (processor.endOfUniformBufferProcessor) {
                        value = processor.endOfUniformBufferProcessor(this.line, options.isFragment, options.processingContext);
                    }
                }
            }
            result += value + "\r\n";
        }
        this.children.forEach(function (child) {
            result += child.process(preprocessors, options);
        });
        if (this.additionalDefineKey) {
            preprocessors[this.additionalDefineKey] = this.additionalDefineValue || "true";
        }
        return result;
    };
    return ShaderCodeNode;
}());
export { ShaderCodeNode };
//# sourceMappingURL=shaderCodeNode.js.map
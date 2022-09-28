/* eslint-disable @typescript-eslint/naming-convention */
/** @hidden */
var ShaderDefineExpression = /** @class */ (function () {
    function ShaderDefineExpression() {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ShaderDefineExpression.prototype.isTrue = function (preprocessors) {
        return true;
    };
    ShaderDefineExpression.postfixToInfix = function (postfix) {
        var stack = [];
        for (var _i = 0, postfix_1 = postfix; _i < postfix_1.length; _i++) {
            var c = postfix_1[_i];
            if (ShaderDefineExpression._OperatorPriority[c] === undefined) {
                stack.push(c);
            }
            else {
                var v1 = stack[stack.length - 1], v2 = stack[stack.length - 2];
                stack.length -= 2;
                stack.push("(".concat(v2).concat(c).concat(v1, ")"));
            }
        }
        return stack[stack.length - 1];
    };
    ShaderDefineExpression.infixToPostfix = function (infix) {
        var result = [];
        var stackIdx = -1;
        var pushOperand = function () {
            operand = operand.trim();
            if (operand !== "") {
                result.push(operand);
                operand = "";
            }
        };
        var push = function (s) {
            if (stackIdx < ShaderDefineExpression._Stack.length - 1) {
                ShaderDefineExpression._Stack[++stackIdx] = s;
            }
        };
        var peek = function () { return ShaderDefineExpression._Stack[stackIdx]; };
        var pop = function () { return (stackIdx === -1 ? "!!INVALID EXPRESSION!!" : ShaderDefineExpression._Stack[stackIdx--]); };
        var idx = 0, operand = "";
        while (idx < infix.length) {
            var c = infix.charAt(idx), token = idx < infix.length - 1 ? infix.substr(idx, 2) : "";
            if (c === "(") {
                operand = "";
                push(c);
            }
            else if (c === ")") {
                pushOperand();
                while (stackIdx !== -1 && peek() !== "(") {
                    result.push(pop());
                }
                pop();
            }
            else if (ShaderDefineExpression._OperatorPriority[token] > 1) {
                pushOperand();
                while (stackIdx !== -1 && ShaderDefineExpression._OperatorPriority[peek()] >= ShaderDefineExpression._OperatorPriority[token]) {
                    result.push(pop());
                }
                push(token);
                idx++;
            }
            else {
                operand += c;
            }
            idx++;
        }
        pushOperand();
        while (stackIdx !== -1) {
            if (peek() === "(") {
                pop();
            }
            else {
                result.push(pop());
            }
        }
        return result;
    };
    ShaderDefineExpression._OperatorPriority = {
        ")": 0,
        "(": 1,
        "||": 2,
        "&&": 3,
    };
    ShaderDefineExpression._Stack = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    return ShaderDefineExpression;
}());
export { ShaderDefineExpression };
//# sourceMappingURL=shaderDefineExpression.js.map
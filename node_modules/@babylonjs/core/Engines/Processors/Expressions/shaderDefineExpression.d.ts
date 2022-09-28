/** @hidden */
export declare class ShaderDefineExpression {
    isTrue(preprocessors: {
        [key: string]: string;
    }): boolean;
    private static _OperatorPriority;
    private static _Stack;
    static postfixToInfix(postfix: string[]): string;
    static infixToPostfix(infix: string): string[];
}

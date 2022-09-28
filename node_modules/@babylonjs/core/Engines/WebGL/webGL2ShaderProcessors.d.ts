import { ShaderLanguage } from "../../Materials/shaderLanguage";
import type { IShaderProcessor } from "../Processors/iShaderProcessor";
/** @hidden */
export declare class WebGL2ShaderProcessor implements IShaderProcessor {
    shaderLanguage: ShaderLanguage;
    attributeProcessor(attribute: string): string;
    varyingProcessor(varying: string, isFragment: boolean): string;
    postProcessor(code: string, defines: string[], isFragment: boolean): string;
}

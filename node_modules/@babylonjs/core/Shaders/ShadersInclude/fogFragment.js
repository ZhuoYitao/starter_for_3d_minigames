// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "fogFragment";
var shader = "#ifdef FOG\nfloat fog=CalcFogFactor();\n#ifdef PBR\nfog=toLinearSpace(fog);\n#endif\ncolor.rgb=mix(vFogColor,color.rgb,fog);\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var fogFragment = { name: name, shader: shader };
//# sourceMappingURL=fogFragment.js.map
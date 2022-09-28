// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "oitBackBlendPixelShader";
var shader = "precision highp float;\nuniform sampler2D uBackColor;\nvoid main() {\nglFragColor=texelFetch(uBackColor,ivec2(gl_FragCoord.xy),0);\nif (glFragColor.a==0.0) { \ndiscard;\n}\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var oitBackBlendPixelShader = { name: name, shader: shader };
//# sourceMappingURL=oitBackBlend.fragment.js.map
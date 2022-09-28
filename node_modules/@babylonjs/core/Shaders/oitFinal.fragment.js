// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "oitFinalPixelShader";
var shader = "precision highp float;\nuniform sampler2D uFrontColor;\nuniform sampler2D uBackColor;\nvoid main() {\nivec2 fragCoord=ivec2(gl_FragCoord.xy);\nvec4 frontColor=texelFetch(uFrontColor,fragCoord,0);\nvec4 backColor=texelFetch(uBackColor,fragCoord,0);\nfloat alphaMultiplier=1.0-frontColor.a;\nglFragColor=vec4(\nfrontColor.rgb+alphaMultiplier*backColor.rgb,\nfrontColor.a+backColor.a\n);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var oitFinalPixelShader = { name: name, shader: shader };
//# sourceMappingURL=oitFinal.fragment.js.map
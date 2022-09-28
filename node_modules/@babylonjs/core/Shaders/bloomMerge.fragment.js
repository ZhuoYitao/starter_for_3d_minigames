// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "bloomMergePixelShader";
var shader = "uniform sampler2D textureSampler;\nuniform sampler2D bloomBlur;\nvarying vec2 vUV;\nuniform float bloomWeight;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\ngl_FragColor=texture2D(textureSampler,vUV);\nvec3 blurred=texture2D(bloomBlur,vUV).rgb;\ngl_FragColor.rgb=gl_FragColor.rgb+(blurred.rgb*bloomWeight); \n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var bloomMergePixelShader = { name: name, shader: shader };
//# sourceMappingURL=bloomMerge.fragment.js.map
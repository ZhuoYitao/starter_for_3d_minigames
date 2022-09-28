// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
var name = "grainPixelShader";
var shader = "#include<helperFunctions>\nuniform sampler2D textureSampler; \nuniform float intensity;\nuniform float animatedSeed;\nvarying vec2 vUV;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\ngl_FragColor=texture2D(textureSampler,vUV);\nvec2 seed=vUV*(animatedSeed);\nfloat grain=dither(seed,intensity);\nfloat lum=getLuminance(gl_FragColor.rgb);\nfloat grainAmount=(cos(-PI+(lum*PI*2.))+1.)/2.;\ngl_FragColor.rgb+=grain*grainAmount;\ngl_FragColor.rgb=max(gl_FragColor.rgb,0.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var grainPixelShader = { name: name, shader: shader };
//# sourceMappingURL=grain.fragment.js.map
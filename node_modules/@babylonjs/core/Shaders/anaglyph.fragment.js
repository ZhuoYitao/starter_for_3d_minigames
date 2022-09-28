// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "anaglyphPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D leftSampler;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\nvec4 leftFrag=texture2D(leftSampler,vUV);\nleftFrag=vec4(1.0,leftFrag.g,leftFrag.b,1.0);\nvec4 rightFrag=texture2D(textureSampler,vUV);\nrightFrag=vec4(rightFrag.r,1.0,1.0,1.0);\ngl_FragColor=vec4(rightFrag.rgb*leftFrag.rgb,1.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var anaglyphPixelShader = { name: name, shader: shader };
//# sourceMappingURL=anaglyph.fragment.js.map
// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "highlightsPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\nconst vec3 RGBLuminanceCoefficients=vec3(0.2126,0.7152,0.0722);\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\nvec4 tex=texture2D(textureSampler,vUV);\nvec3 c=tex.rgb;\nfloat luma=dot(c.rgb,RGBLuminanceCoefficients);\ngl_FragColor=vec4(pow(c,vec3(25.0-luma*15.0)),tex.a); \n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var highlightsPixelShader = { name: name, shader: shader };
//# sourceMappingURL=highlights.fragment.js.map
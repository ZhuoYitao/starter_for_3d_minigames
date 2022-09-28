// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "volumetricLightScatteringPassPixelShader";
var shader = "#if defined(ALPHATEST) || defined(NEED_UV)\nvarying vec2 vUV;\n#endif\n#if defined(ALPHATEST)\nuniform sampler2D diffuseSampler;\n#endif\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\n#if defined(ALPHATEST)\nvec4 diffuseColor=texture2D(diffuseSampler,vUV);\nif (diffuseColor.a<0.4)\ndiscard;\n#endif\ngl_FragColor=vec4(0.0,0.0,0.0,1.0);\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var volumetricLightScatteringPassPixelShader = { name: name, shader: shader };
//# sourceMappingURL=volumetricLightScatteringPass.fragment.js.map
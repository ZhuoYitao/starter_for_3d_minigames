// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "vrMultiviewToSingleviewPixelShader";
var shader = "precision mediump sampler2DArray;\nvarying vec2 vUV;\nuniform sampler2DArray multiviewSampler;\nuniform int imageIndex;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\ngl_FragColor=texture2D(multiviewSampler,vec3(vUV,imageIndex));\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var vrMultiviewToSingleviewPixelShader = { name: name, shader: shader };
//# sourceMappingURL=vrMultiviewToSingleview.fragment.js.map
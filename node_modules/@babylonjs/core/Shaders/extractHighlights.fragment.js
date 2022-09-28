// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
var name = "extractHighlightsPixelShader";
var shader = "#include<helperFunctions>\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float threshold;\nuniform float exposure;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\ngl_FragColor=texture2D(textureSampler,vUV);\nfloat luma=getLuminance(gl_FragColor.rgb*exposure);\ngl_FragColor.rgb=step(threshold,luma)*gl_FragColor.rgb;\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var extractHighlightsPixelShader = { name: name, shader: shader };
//# sourceMappingURL=extractHighlights.fragment.js.map
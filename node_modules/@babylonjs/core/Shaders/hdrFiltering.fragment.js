// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/helperFunctions.js";
import "./ShadersInclude/importanceSampling.js";
import "./ShadersInclude/pbrBRDFFunctions.js";
import "./ShadersInclude/hdrFilteringFunctions.js";
var name = "hdrFilteringPixelShader";
var shader = "#include<helperFunctions>\n#include<importanceSampling>\n#include<pbrBRDFFunctions>\n#include<hdrFilteringFunctions>\nuniform float alphaG;\nuniform samplerCube inputTexture;\nuniform vec2 vFilteringInfo;\nuniform float hdrScale;\nvarying vec3 direction;\nvoid main() {\nvec3 color=radiance(alphaG,inputTexture,direction,vFilteringInfo);\ngl_FragColor=vec4(color*hdrScale,1.0);\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var hdrFilteringPixelShader = { name: name, shader: shader };
//# sourceMappingURL=hdrFiltering.fragment.js.map
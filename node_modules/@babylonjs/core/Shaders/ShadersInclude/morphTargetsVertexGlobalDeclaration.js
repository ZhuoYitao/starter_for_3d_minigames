// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertexGlobalDeclaration";
var shader = "#ifdef MORPHTARGETS\nuniform float morphTargetInfluences[NUM_MORPH_INFLUENCERS];\n#ifdef MORPHTARGETS_TEXTURE \nprecision mediump sampler2DArray; \nuniform float morphTargetTextureIndices[NUM_MORPH_INFLUENCERS];\nuniform vec3 morphTargetTextureInfo;\nuniform sampler2DArray morphTargets;\nvec3 readVector3FromRawSampler(int targetIndex,float vertexIndex)\n{ \nfloat y=floor(vertexIndex/morphTargetTextureInfo.y);\nfloat x=vertexIndex-y*morphTargetTextureInfo.y;\nvec3 textureUV=vec3((x+0.5)/morphTargetTextureInfo.y,(y+0.5)/morphTargetTextureInfo.z,morphTargetTextureIndices[targetIndex]);\nreturn texture(morphTargets,textureUV).xyz;\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var morphTargetsVertexGlobalDeclaration = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertexGlobalDeclaration.js.map
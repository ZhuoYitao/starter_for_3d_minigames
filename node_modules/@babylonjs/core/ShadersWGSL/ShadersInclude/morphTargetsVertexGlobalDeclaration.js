// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertexGlobalDeclaration";
var shader = "#ifdef MORPHTARGETS\nuniform morphTargetInfluences : array<f32,NUM_MORPH_INFLUENCERS>;\n#ifdef MORPHTARGETS_TEXTURE \nuniform morphTargetTextureIndices : array<f32,NUM_MORPH_INFLUENCERS>;\nuniform morphTargetTextureInfo : vec3<f32>;\nvar morphTargets : texture_2d_array<f32>;\nvar morphTargetsSampler : sampler;\nfn readVector3FromRawSampler(targetIndex : i32,vertexIndex : f32)->vec3<f32>\n{ \nlet y=floor(vertexIndex/uniforms.morphTargetTextureInfo.y);\nlet x=vertexIndex-y*uniforms.morphTargetTextureInfo.y;\nlet textureUV=vec2<f32>((x+0.5)/uniforms.morphTargetTextureInfo.y,(y+0.5)/uniforms.morphTargetTextureInfo.z);\nreturn textureSampleLevel(morphTargets,morphTargetsSampler,textureUV,i32(uniforms.morphTargetTextureIndices[targetIndex]),0.0).xyz;\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var morphTargetsVertexGlobalDeclaration = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertexGlobalDeclaration.js.map
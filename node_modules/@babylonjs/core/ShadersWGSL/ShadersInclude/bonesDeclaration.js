// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bonesDeclaration";
var shader = "#if NUM_BONE_INFLUENCERS>0\nattribute matricesIndices : vec4<f32>;\nattribute matricesWeights : vec4<f32>;\n#if NUM_BONE_INFLUENCERS>4\nattribute matricesIndicesExtra : vec4<f32>;\nattribute matricesWeightsExtra : vec4<f32>;\n#endif\n#ifndef BAKED_VERTEX_ANIMATION_TEXTURE\n#ifdef BONETEXTURE\nvar boneSampler : texture_2d<f32>;\nuniform boneTextureWidth : f32;\n#else\nuniform mBones : array<mat4x4,BonesPerMesh>;\n#ifdef BONES_VELOCITY_ENABLED\nuniform mPreviousBones : array<mat4x4,BonesPerMesh>;\n#endif\n#endif\n#ifdef BONETEXTURE\nfn readMatrixFromRawSampler(smp : texture_2d<f32>,index : f32)->mat4x4<f32>\n{\nlet offset=i32(index) *4; \nlet m0=textureLoad(smp,vec2<i32>(offset+0,0),0);\nlet m1=textureLoad(smp,vec2<i32>(offset+1,0),0);\nlet m2=textureLoad(smp,vec2<i32>(offset+2,0),0);\nlet m3=textureLoad(smp,vec2<i32>(offset+3,0),0);\nreturn mat4x4<f32>(m0,m1,m2,m3);\n}\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var bonesDeclaration = { name: name, shader: shader };
//# sourceMappingURL=bonesDeclaration.js.map
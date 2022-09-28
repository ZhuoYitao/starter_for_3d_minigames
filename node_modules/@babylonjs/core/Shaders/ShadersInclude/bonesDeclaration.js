// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bonesDeclaration";
var shader = "#if NUM_BONE_INFLUENCERS>0\nattribute vec4 matricesIndices;\nattribute vec4 matricesWeights;\n#if NUM_BONE_INFLUENCERS>4\nattribute vec4 matricesIndicesExtra;\nattribute vec4 matricesWeightsExtra;\n#endif\n#ifndef BAKED_VERTEX_ANIMATION_TEXTURE\n#ifdef BONETEXTURE\nuniform sampler2D boneSampler;\nuniform float boneTextureWidth;\n#else\nuniform mat4 mBones[BonesPerMesh];\n#ifdef BONES_VELOCITY_ENABLED\nuniform mat4 mPreviousBones[BonesPerMesh];\n#endif\n#endif\n#ifdef BONETEXTURE\n#define inline\nmat4 readMatrixFromRawSampler(sampler2D smp,float index)\n{\nfloat offset=index *4.0;\nfloat dx=1.0/boneTextureWidth;\nvec4 m0=texture2D(smp,vec2(dx*(offset+0.5),0.));\nvec4 m1=texture2D(smp,vec2(dx*(offset+1.5),0.));\nvec4 m2=texture2D(smp,vec2(dx*(offset+2.5),0.));\nvec4 m3=texture2D(smp,vec2(dx*(offset+3.5),0.));\nreturn mat4(m0,m1,m2,m3);\n}\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var bonesDeclaration = { name: name, shader: shader };
//# sourceMappingURL=bonesDeclaration.js.map
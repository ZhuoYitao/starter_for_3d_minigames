// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bakedVertexAnimationDeclaration";
var shader = "#ifdef BAKED_VERTEX_ANIMATION_TEXTURE\nuniform bakedVertexAnimationTime: f32;\nuniform bakedVertexAnimationTextureSizeInverted: vec2<f32>;\nuniform bakedVertexAnimationSettings: vec4<f32>;\nvar bakedVertexAnimationTexture : texture_2d<f32>;\n#ifdef INSTANCES\nattribute bakedVertexAnimationSettingsInstanced : vec4<f32>;\n#endif\nfn readMatrixFromRawSamplerVAT(smp : texture_2d<f32>,index : f32,frame : f32)->mat4x4<f32>\n{\nlet offset=i32(index)*4;\nlet frameUV=i32(frame);\nlet m0=textureLoad(smp,vec2<i32>(offset+0,frameUV),0);\nlet m1=textureLoad(smp,vec2<i32>(offset+1,frameUV),0);\nlet m2=textureLoad(smp,vec2<i32>(offset+2,frameUV),0);\nlet m3=textureLoad(smp,vec2<i32>(offset+3,frameUV),0);\nreturn mat4x4<f32>(m0,m1,m2,m3);\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var bakedVertexAnimationDeclaration = { name: name, shader: shader };
//# sourceMappingURL=bakedVertexAnimationDeclaration.js.map
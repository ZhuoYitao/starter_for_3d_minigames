// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bakedVertexAnimationDeclaration";
var shader = "#ifdef BAKED_VERTEX_ANIMATION_TEXTURE\nuniform float bakedVertexAnimationTime;\nuniform vec2 bakedVertexAnimationTextureSizeInverted;\nuniform vec4 bakedVertexAnimationSettings;\nuniform sampler2D bakedVertexAnimationTexture;\n#ifdef INSTANCES\nattribute vec4 bakedVertexAnimationSettingsInstanced;\n#endif\n#define inline\nmat4 readMatrixFromRawSamplerVAT(sampler2D smp,float index,float frame)\n{\nfloat offset=index*4.0;\nfloat frameUV=(frame+0.5)*bakedVertexAnimationTextureSizeInverted.y;\nfloat dx=bakedVertexAnimationTextureSizeInverted.x;\nvec4 m0=texture2D(smp,vec2(dx*(offset+0.5),frameUV));\nvec4 m1=texture2D(smp,vec2(dx*(offset+1.5),frameUV));\nvec4 m2=texture2D(smp,vec2(dx*(offset+2.5),frameUV));\nvec4 m3=texture2D(smp,vec2(dx*(offset+3.5),frameUV));\nreturn mat4(m0,m1,m2,m3);\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var bakedVertexAnimationDeclaration = { name: name, shader: shader };
//# sourceMappingURL=bakedVertexAnimationDeclaration.js.map
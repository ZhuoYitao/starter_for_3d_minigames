// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "harmonicsFunctions";
var shader = "#ifdef USESPHERICALFROMREFLECTIONMAP\n#ifdef SPHERICAL_HARMONICS\nvec3 computeEnvironmentIrradiance(vec3 normal) {\nreturn vSphericalL00\n+ vSphericalL1_1*(normal.y)\n+ vSphericalL10*(normal.z)\n+ vSphericalL11*(normal.x)\n+ vSphericalL2_2*(normal.y*normal.x)\n+ vSphericalL2_1*(normal.y*normal.z)\n+ vSphericalL20*((3.0*normal.z*normal.z)-1.0)\n+ vSphericalL21*(normal.z*normal.x)\n+ vSphericalL22*(normal.x*normal.x-(normal.y*normal.y));\n}\n#else\nvec3 computeEnvironmentIrradiance(vec3 normal) {\nfloat Nx=normal.x;\nfloat Ny=normal.y;\nfloat Nz=normal.z;\nvec3 C1=vSphericalZZ.rgb;\nvec3 Cx=vSphericalX.rgb;\nvec3 Cy=vSphericalY.rgb;\nvec3 Cz=vSphericalZ.rgb;\nvec3 Cxx_zz=vSphericalXX_ZZ.rgb;\nvec3 Cyy_zz=vSphericalYY_ZZ.rgb;\nvec3 Cxy=vSphericalXY.rgb;\nvec3 Cyz=vSphericalYZ.rgb;\nvec3 Czx=vSphericalZX.rgb;\nvec3 a1=Cyy_zz*Ny+Cy;\nvec3 a2=Cyz*Nz+a1;\nvec3 b1=Czx*Nz+Cx;\nvec3 b2=Cxy*Ny+b1;\nvec3 b3=Cxx_zz*Nx+b2;\nvec3 t1=Cz *Nz+C1;\nvec3 t2=a2 *Ny+t1;\nvec3 t3=b3 *Nx+t2;\nreturn t3;\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var harmonicsFunctions = { name: name, shader: shader };
//# sourceMappingURL=harmonicsFunctions.js.map
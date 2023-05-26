import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Update } from '../libs/update';
import vs from '../glsl/paper.vert';
import fs from '../glsl/paper.frag';
import vs2 from '../glsl/base.vert';
import fs2 from '../glsl/bg.frag';
import { Object3D, Mesh, PlaneGeometry, RawShaderMaterial, DoubleSide, UniformsUtils, Vector2, Color, ShaderMaterial } from 'three';
import { Util } from '../libs/util';
import { Conf } from '../core/conf';
import { TexLoader } from '../webgl/texLoader';
import { Param } from '../core/param';
import { MousePointer } from '../core/mousePointer';
import { HSL } from '../libs/hsl';

export class Visual extends Canvas {

  private _con:Object3D;
  private _bg: Mesh;
  private _paper: Array<Mesh> = [];
  private _paperParam: Array<any> = [];
  private _bgColor: Color = new Color(0xffffff);

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    this._bg = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader:vs2,
        fragmentShader:fs2,
        // transparent:true,
        side:DoubleSide,
        depthTest:false,
        uniforms:{
          tDiffuse:{value: TexLoader.instance.get(Conf.instance.PATH_IMG + 't-text.png')},
        }
      })
      // new MeshBasicMaterial({
      //   // transparent: true,
      //   map: TexLoader.instance.get(Conf.instance.PATH_IMG + 't-text.png'),
      //   depthTest: false,
      //   side: DoubleSide,
      // })
    );
    this._con.add(this._bg);
    this._bg.renderOrder = 0;

    const geo = new PlaneGeometry(1, 1, 64, 128)
    const tex = TexLoader.instance.get(Conf.instance.PATH_IMG + 't-text.png')
    const num = 30
    for(let i = 0; i < num; i++){
      const hsl = new HSL()
      hsl.h = Util.random(0.45, 0.6)
      hsl.l = Util.random(0.5, 0.75)
      hsl.s = Util.random(0.5, 0.75)

      const col = new Color()
      col.setHSL(hsl.h, hsl.s, hsl.l)

      const it = 1 / num;
      const uni = {
        tDiffuse:{value:null, type:'t'},
        col:{value: col},
        angle:{value: 0},
        progress:{value: 0},
        radOffset:{value: 1},
        rollsOffset:{value: 1},
        range:{value: new Vector2(i * it, i * it + it)},
      }

      const p = new Mesh(
        geo,
        new RawShaderMaterial({
          vertexShader: vs,
          fragmentShader: fs,
          side: DoubleSide,
          depthTest: false,
          uniforms: UniformsUtils.merge([
            uni,
          ])
        })
      )
      this._con.add(p);
      p.renderOrder = 1 + (num - i);
      this._getUni(p).tDiffuse.value = tex
      this._paper.push(p)

      this._paperParam.push({
        ang: Util.range(30)
      })
    }

    this._resize();
  }


  protected _update(): void {
    super._update();

    // const w = Func.instance.sw();
    // const h = Func.instance.sh();

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y;

    const bgColA = new Color(0xffffff);
    const bgColB = new Color(0x000000);
    this._bgColor = bgColA.lerp(bgColB, Util.map(my, 0, 1, -1, 1));

    const paperParam = Param.instance.paper;

    this._paper.forEach((p, i) => {
      const key = this._paper.length - i;
      const uni = this._getUni(p);
      // uni.angle.value = Util.radian(Util.map(paperParam.angle.value, 0, 90, 0, 100) + (my * -1) * 30);
      uni.angle.value = Util.radian(Math.min(90, 90 + this._paperParam[i].ang));
      // uni.progress.value = Util.map(paperParam.progress.value, 1, 0, 0, 100);
      // uni.progress.value = 1 - (Util.map(my, 0.6 + key * 0.2, 0, -1, 1) + Math.cos(Util.radian(this._c * 1)) * 0.01);
      uni.progress.value = 1 - (Util.map(my, 1.5, 0, -1, 1) + Math.cos(Util.radian(key * 10 + this._c * 1)) * 0.1);
      uni.radOffset.value = paperParam.radOffset.value * 0.01;
      uni.rollsOffset.value = paperParam.rollsOffset.value * 0.01;

      p.rotation.x = Util.radian(my * -45);
      p.rotation.y = Util.radian(mx * 45);
    })

    this._bg.rotation.x = this._paper[0].rotation.x
    this._bg.rotation.y = this._paper[0].rotation.y

    this.cameraPers.position.z = Param.instance.camera.z.value * 0.01 * Func.instance.val(1.5, 1);

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(this._bgColor, 1);
    this.renderer.render(this.mainScene, this.cameraPers);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 45;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}

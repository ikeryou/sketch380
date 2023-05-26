import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Conf } from './conf';
import { Update } from '../libs/update';
import { FPS } from '../core/fps';

export class Param {
  private static _instance: Param;

  public fps: number = FPS.MIDDLE;
  public debug:HTMLElement = document.querySelector('.l-debug') as HTMLElement;
  public scrollRate:number = 0;

  private _dat: any;
  private _stats: any;

  public paper = {
    angle:{value: 22, min: 0, max: 100},
    progress:{value: 0, min: 0, max: 100},
    radOffset:{value: 200, min: 0, max: 500},
    rollsOffset:{value: 30, min: 0, max: 500},
    rotX:{value: 0, min: -180, max: 180},
    rotY:{value: 0, min: -180, max: 180},
  }

  public light = {
    x:{value:-40, min:-100, max:100},
    y:{value:-25, min:-100, max:100},
    z:{value:50, min:-100, max:100},
    intensity:{value:40, min:0, max:50},
  }

  public camera = {
    z:{value:130, min:-300, max:300},
  }

  constructor() {
    if (Conf.instance.FLG_PARAM) {
      this.makeParamGUI();
    }

    if (Conf.instance.FLG_STATS) {
      this._stats = Stats();
      document.body.appendChild(this._stats.domElement);
    }

    Update.instance.add(() => {
      this._update();
    });
  }

  private _update(): void {
    if (this._stats != undefined) {
      this._stats.update();
    }
  }

  public static get instance(): Param {
    if (!this._instance) {
      this._instance = new Param();
    }
    return this._instance;
  }

  public makeParamGUI(): void {
    if (this._dat != undefined) return;

    this._dat = new GUI();
    this._add(this.paper, 'paper');
    // this._add(this.light, 'light');
    // this._add(this.camera, 'camera');
  }

  private _add(obj: any, folderName: string): void {
    const folder = this._dat.addFolder(folderName);
    for (var key in obj) {
      const val: any = obj[key];
      if (val.use == undefined) {
        if (val.type == 'color') {
          folder.addColor(val, 'value').name(key);
        } else {
          if (val.list != undefined) {
            folder.add(val, 'value', val.list).name(key);
          } else {
            folder.add(val, 'value', val.min, val.max).name(key);
          }
        }
      }
    }
  }
}

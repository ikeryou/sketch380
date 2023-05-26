import { MyDisplay } from "../core/myDisplay";
import { Visual } from "./visual";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  constructor(opt:any) {
    super(opt)

    new Visual({
      el:document.querySelector('.l-canvas-a'),
      transparent: false,
    });
  }
}
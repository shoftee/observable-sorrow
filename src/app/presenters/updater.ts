import { reactive } from "vue";
import { mergeWith } from "lodash";

import { IPresenterChangeSink, PropertyBag } from "@/_interfaces";

export interface IRootPresenter {
  get<T>(key: string): T;
}

export class Updater implements IPresenterChangeSink, IRootPresenter {
  private readonly values: Map<string, PropertyBag>;

  constructor() {
    this.values = new Map<string, PropertyBag>();
  }

  update(changes: Map<string, PropertyBag>): void {
    for (const [key, value] of changes) {
      const updated = updateObject(value, this.values.get(key));
      this.values.set(key, updated);
    }
  }

  get<T>(key: string): T {
    return this.values.get(key) as T;
  }
}

function updateObject(src: PropertyBag, dst?: PropertyBag): PropertyBag {
  dst = dst ?? reactive({});
  mergeWith(dst, src, (dstValue, srcValue, key, dstObj) => {
    if (srcValue === undefined && dstValue !== undefined) {
      // undefined is a valid value
      dstObj[key] = undefined;
    } else {
      // leave it up to the calling method
      return undefined;
    }
  });
  return dst;
}

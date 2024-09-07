import { TimeoutOptions } from "./types";

export class Timeout {
  list: Map<string, number> = new Map();
  maxStrikes: number = 1;

  constructor(options?: TimeoutOptions) {
    if (options?.maxStrikes) this.maxStrikes = options.maxStrikes;
  }

  /**
   * Check if an id is on timeout
   * @param id
   */
  is(id: string) {
    const strikes = this.list.get(id) || 0;

    return strikes > this.maxStrikes;
  }

  /**
   * Gives a strike, and returns the number the key has
   * @param id
   */
  set(id: string, timeMiliseconds: number) {
    let strikes = this.list.get(id) || 0;

    strikes++;

    this.list.set(id, strikes);

    setTimeout(() => {
      let strikes = this.list.get(id) || 0;

      strikes--;

      if (strikes <= 0) this.list.delete(id);
      else this.list.set(id, strikes);
    }, timeMiliseconds);

    return strikes;
  }
}

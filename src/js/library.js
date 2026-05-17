import patternsData from "../lexicon.json";

export class PatternLibrary {
  #patterns;

  constructor(patterns) {
    this.#patterns = patterns;
  }

  static load() {
    return new PatternLibrary(patternsData);
  }

  find(name) {
    const entry = this.#patterns.find((p) => p.name === name);
    if (!entry) throw new Error(`Unknown pattern: "${name}"`);
    return entry;
  }

  populate(selectEl) {
    this.#patterns.forEach((entry) => {
      const opt = document.createElement("option");
      opt.text = entry.name;
      selectEl.add(opt);
    });
  }
}

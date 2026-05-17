export class PatternLibrary {
  #patterns;

  constructor(patterns) {
    this.#patterns = patterns;
  }

  static async load(url) {
    const patterns = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType("application/json");
      xhr.open("GET", url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          xhr.status === 200
            ? resolve(JSON.parse(xhr.responseText))
            : reject(new Error(`Failed to load ${url}: ${xhr.status}`));
        }
      };
      xhr.send(null);
    });
    return new PatternLibrary(patterns);
  }

  find(name) {
    return this.#patterns.find((p) => p.name === name);
  }

  populate(selectEl) {
    this.#patterns.forEach((entry) => {
      const opt = document.createElement("option");
      opt.text = entry.name;
      selectEl.add(opt);
    });
  }
}

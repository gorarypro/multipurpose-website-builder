class ComponentLoader {
  constructor() {
    this.components = new Map();
  }

  async loadComponent(componentName) {
    console.log("Loading component: " + componentName);
  }
}

export { ComponentLoader };

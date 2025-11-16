class HeroComponent {
  constructor() {
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const heroHTML = "<section class=\"hero\"><div class=\"container\"><h1>Welcome</h1></div></section>";
    document.body.insertAdjacentHTML("afterbegin", heroHTML);
  }
}

window.HeroComponent = HeroComponent;

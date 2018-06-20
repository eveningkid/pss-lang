class StyleElement {
  constructor(selector, styles=[], parent=null) {
    this.selector = selector;
    this.styles = styles;
    this.parent = parent;
  }

  setSelector(selector) {
    this.selector = selector;
  }

  pushStyle(style) {
    this.styles.push(style);
  }

  setParent(parent) {
    this.parent = parent;
  }
}

module.exports = StyleElement;

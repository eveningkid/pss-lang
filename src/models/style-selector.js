class StyleSelector {
  constructor(type, name, value, options) {
    this.type = type;
    this.name = name;
    this.value = value || null;
    this.options = options || {};
  }
}

StyleSelector.TYPES = {
  CONDITIONAL: 'conditional',
  CUSTOM_TAG: 'customTag',
  EXTEND_TAG: 'extendTag',
  ORIGINAL_TAG: 'originalTag',
  RAW: 'raw',
};

module.exports = StyleSelector;

class StylePropertyValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

StylePropertyValue.TYPES = {
  COMPUTED: 'computed',
  RAW: 'raw',
};

module.exports = StylePropertyValue;

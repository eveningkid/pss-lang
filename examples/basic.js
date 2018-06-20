const Parser = require('./src');
const source = `button.Button {
  color: $theme.white;

  &:hover {
    color: red;
  }

  &:isSelected {
    color: $isSelectedColor;
  }
}`;
const output = Parser.parse(source);
console.log(require('util').inspect(output, { depth: null }));

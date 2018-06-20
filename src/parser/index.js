const StyleElement = require('../models/style-element');
const StyleSelector = require('../models/style-selector');
const StyleProperty = require('../models/style-property');
const StylePropertyValue = require('../models/style-property-value');
const CSSPseudoClasses = require('../constants/css-pseudo-classes');

const Parser = {
  REGEXES: {
    COMMENT: new RegExp('^//', 'g'),
    CURLY_BRACES: new RegExp('\{|\}', 'g'),
    CSS_PSEUDO_CLASS: new RegExp(CSSPseudoClasses.join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\-/g, '\\-'), 'g'),
    EXTEND: new RegExp('@extend', 'g'),
    UPPERCASED: new RegExp('[A-Z]', 'g'),
  },

  getSelectorFromFirstLine(line) {
    let selectorType;
    if (line.charAt(0).match(this.REGEXES.UPPERCASED)) {
      selectorType = StyleSelector.TYPES.CUSTOM_TAG;
    } else {
      selectorType = StyleSelector.TYPES.ORIGINAL_TAG;
    }


    const fullSelector = line.replace('{', '').trim();
    const splittedSelector = fullSelector.split('.');
    let extendFrom;
    let selectorName;
    switch (splittedSelector.length) {
      case 1:
        const extender = splittedSelector[0];
        if (extender.charAt(0).match(this.REGEXES.UPPERCASED)) {
          // Button
          extendFrom = 'div'; // Default element to extend
          selectorName = extender;
        } else {
          // button
          extendFrom = extender;
        }
        break;

      case 2:
        // button.Button
        extendFrom = splittedSelector[0];
        selectorName = splittedSelector[1];
        break;

      default:
        throw new Error(
          'Could not read the component selector name. ' +
          'Accepted format can only be: Button, button.Button, or button'
        );
    }

    return new StyleSelector(selectorType, selectorName, null, {
      isExtension: true,
      extendFrom,
    });
  },

  walkThroughStylesheet(output, lines) {
    let depth = 0;
    let currentNestedNode = output;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim();

      // Remove empty or comment lines
      if (line.length === 0 || line.match(this.REGEXES.COMMENT)) {
        continue;
      }

      // @extend ...;
      if (line.match(this.REGEXES.EXTEND)) {
        const extendFrom = line.replace(';', '').replace('@extend', '').trim();
        const selector = new StyleSelector(
          StyleSelector.TYPES.EXTEND_TAG,
          output.selector.name,
          null,
          { isExtension: true, extendFrom }
        );
        output.setSelector(selector);
        continue;
      }

      const lineLastCharacter = line.substr(-1);
      if (line.match(this.REGEXES.CURLY_BRACES)) {
        // Depth increased
        if (lineLastCharacter === '{') {
          depth++;
          let selectorName = line.replace('{', '').trim();
          let selectorValue;

          // &:prop { ... }
          let selectorType;
          if (!line.match(this.REGEXES.CSS_PSEUDO_CLASS) && line.substr(0, 2) === '&:') {
            selectorType = StyleSelector.TYPES.CONDITIONAL;
            selectorName = selectorName.replace('&:', 'props.');
            selectorValue = {
              leftHand: selectorName,
              rightHand: null,
            };
          } else {
            selectorType = StyleSelector.TYPES.RAW;
          }

          const selector = new StyleSelector(selectorType, selectorName, selectorValue);
          const previousNestedNode = currentNestedNode;
          currentNestedNode = new StyleElement(selector);
          currentNestedNode.setParent(previousNestedNode);
        }

        // Depth decreased
        if (lineLastCharacter === '}') {
          depth--;
          if (currentNestedNode.parent) {
            currentNestedNode.parent.pushStyle(currentNestedNode);
            currentNestedNode = currentNestedNode.parent;
          }
        }
      } else {
        // 'font-size: 13px'
        // => property='font-size', value='13px'
        let [property, value] = line.split(':');
        property = property.trim();
        value = value.trim().replace(';', '');

        let type;

        // Computed value
        // font-size: $theme.primary
        // font-size: $props.theme.primary
        if (value.charAt(0) === '$') {
          type = StylePropertyValue.TYPES.COMPUTED;
          value = value.replace('$_', '$props.').substr(1);
        } else {
          type = StylePropertyValue.TYPES.RAW;
        }

        const propertyValue = new StylePropertyValue(type, value);
        const style = new StyleProperty(property, propertyValue);
        currentNestedNode.pushStyle(style);
      }
    }
  },

  /**
   * Get rid of all the "parent" attributes
   */
  cleanOutput(output) {
    typeof output.parent !== 'undefined' && delete output.parent;
    if (!output.styles) return;

    for (const child of output.styles) {
      this.cleanOutput(child);
    }

    return output;
  },

  parse(source) {
    const output = new StyleElement();

    // Remove any space around
    source = source.trim();

    const lines = source.split(/\r|\n/);

    const firstLine = lines.shift();
    output.setSelector(this.getSelectorFromFirstLine(firstLine));

    this.walkThroughStylesheet(output, lines);
    this.cleanOutput(output);

    return output;
  },
};

module.exports = Parser;

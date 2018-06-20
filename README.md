# PSS lang
Prop-based StyleSheets aims to improve styling syntax for React.js projects.  

```sass
button.Button {
  // `props.theme.white`
  color: $theme.white;

  &:hover {
    color: red;
  }

  &:isSelected {
    // `color` set to `props.isSelectedColor` when `props.isSelected` is true
    color: $isSelectedColor;
  }
}
```

This repository only includes a parser that generates an AST when given PSS syntax.  

**[💅 Use it with `styled-components`](https://github.com/eveningkid/pss-loader)**

## Why?
If you want to apply prop-based styles to your React components so far, you either need to:
- write CSS classes, then manually map them to each one of our component props  
  `if prop.isSelected, add 'is-selected' CSS class`
- use expressions (with css-in-js) inside style literals  
  `${props => props.isSelected ? 'blue' : 'red'}`

**Now, think about it: do you have any additional logic for mapping our element to `hover` styles only when it'll be hovered?** We don't, because we already acknowledge that writing `:hover` makes it conditionally styled, based on our element's state.  

**The idea here is similar: making props part of that state, right inside our style declaration.**

## Parser Output Example
Here's the generated output for the example code above:
```
StyleElement {
  selector: StyleSelector {
    type: 'originalTag',
    name: 'Button',
    options: { isExtension: true, extendFrom: 'button' }
  },
  styles: [
    StyleProperty {
      property: 'color',
      value: StylePropertyValue { type: 'computed', value: 'theme.white' }
    },
    StyleElement {
      selector: StyleSelector { type: 'raw', name: '&:hover' },
      styles: [
        StyleProperty {
          property: 'color',
          value: StylePropertyValue { type: 'raw', value: 'red' }
        }
      ]
    },
    StyleElement {
      selector: StyleSelector {
        type: 'conditional',
        name: 'props.isSelected',
        value: { leftHand: 'props.isSelected' }
      },
      styles: [
        StyleProperty {
          property: 'color',
          value: StylePropertyValue { type: 'computed', value: 'isSelectedColor' }
        }
      ]
    }
  ]
}
```

*null and empty properties have been omitted*

## License
[eveningkid](https://twitter.com/eveningkid) @ MIT

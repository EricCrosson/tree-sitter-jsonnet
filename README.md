# tree-sitter-jsonnet

![Build Status](https://github.com/EricCrosson/tree-sitter-jsonnet/actions/workflows/continuous-integration.yml/badge.svg?branch=master)

(Not-yet published)
[![NPM Package][]](https://npmjs.org/package/tree-sitter-jsonnet)

[NPM Package]: https://img.shields.io/npm/v/tree-sitter-jsonnet.svg

**Notice**: this grammar is currently unfinished, the problems to be resolved:

- grammar ambiguities

  ```
  ; npm run build
  
  > tree-sitter-jsonnet@0.1.0 build
  > tree-sitter generate
  
  Unresolved conflict for symbol sequence:
  
    '{'  objlocal  •  ','  …
  
  Possible interpretations:
  
    1:  '{'  (member  objlocal)  •  ','  …
    2:  '{'  (objinside_repeat2  objlocal  •  ',')
  
  Possible resolutions:
  
    1:  Specify a higher precedence in `objinside_repeat2` than in the other rules.
    2:  Specify a higher precedence in `member` than in the other rules.
    3:  Specify a left or right associativity in `member`
    4:  Add a conflict for these rules: `objinside`, `member`
  ```
  
  Note this section on the [Jsonnet specification](jsonnet.org/ref/spec.html)
  
  > The abstract syntax by itself cannot unambiguously parse a sequence of tokens.
  > Ambiguities are resolved according to the following rules, which can also be overridden
  > by adding parenthesis symbols ().
  >
  > ...
  
  I hope there is a way to express this in tree-sitter but am not sure one way or another
  at this time.
  
- `|||` text blocks require custom parsing to be written in C as an [external scanner]

I started this project one afternoon as a way to unwind, and have to date have not made much more progress.
I am happy to accept contributions and/or hand off this code to a party with more interest and resources to maintain it.

Snapshot of my open tabs used as reference:

- [JSonnet Specification](https://jsonnet.org/ref/spec.html)
- [lsif implementation](https://github.com/sourcegraph/lsif-jsonnet/blob/master/Jsonnet.g4)
- [tree-sitter-json implementation](https://github.com/tree-sitter/tree-sitter-json/blob/master/grammar.js)
- [tree-sitter-bash implementation](https://github.com/tree-sitter/tree-sitter-bash/blob/master/grammar.js)
- [tree-sitter-go implementation](https://github.com/tree-sitter/tree-sitter-go/blob/master/grammar.js)
- [regex101](https://regex101.com/r/dU5fO8/73)
- [getting started with indentation for the ||| text blocks](https://codeberg.org/FelipeLema/tree-sitter-indent.el/issues/1)
- [external scanners](http://tree-sitter.github.io/tree-sitter/creating-parsers#external-scanners)

[external scanner]: http://tree-sitter.github.io/tree-sitter/creating-parsers#external-scanners

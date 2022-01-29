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
  
- `|||` text blocks require custom parsing to be written in C

I started this project as a way to unwind, and have to date have not made much more progress.
I am happy to accept contributions and/or hand off this code to a party with more interest
and resources to maintain it.

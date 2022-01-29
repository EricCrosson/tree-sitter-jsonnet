module.exports = grammar({
  name: 'jsonnet',
  extras: ($) => [$._comment, /\s/],

  rules: {
    document: ($) => $.expr,

    expr: ($) =>
      choice(
        $.null,
        $.true,
        $.false,
        $.self,
        $.dollar,
        $.string,
        $.number,
        seq('{', $.objinside, '}'),
        // array definition
        seq(
          '[',
          optional(
            seq($.expr, repeat(seq(',', $.expr)), optional(',')),
          ),
          ']',
        ),
        // array definition via list comprehension
        seq(
          '[',
          $.expr,
          optional(','),
          $.forspec,
          repeat(choice($.forspec, $.ifspec)),
          ']',
        ),
        seq($.expr, '.', $.id),
        seq(
          $.expr,
          '[',
          optional($.expr),
          optional(
            seq(
              ':',
              optional($.expr),
              optional(seq(':', optional($.expr))),
            ),
          ),
          ']',
        ),
        seq('super', '.', $.id),
        seq('super', '[', $.expr, ']'),
        seq($.expr, '(', optional($.args), ')'),
        $.id,
        seq('local', $.bind, repeat(seq(',', $.bind)), ';', $.expr),
        seq(
          'if',
          $.expr,
          'then',
          $.expr,
          optional(seq('else', $.expr)),
        ),
        seq($.expr, $.binaryop, $.expr),
        seq($.unaryop, $.expr),
        seq($.expr, '{', $.objinside, '}'),
        seq('function', '(', optional($.params), ')', $.expr),
        seq('assert', ';', $.expr),
        seq('import', $.string),
        seq('importstr', $.string),
        seq('error', $.expr),
        seq($.expr, 'in', 'super'),
      ),

    null: () => 'null',
    true: () => 'true',
    false: () => 'false',
    self: () => 'self',
    dollar: () => '$',

    id: () => /[_a-zA-Z][_a-zA-Z0-9]*/,

    // Can have five quoting forms:
    // 1. Double-quoted, beginning with " and ending with the first subsequent
    //    non-quoted "
    //    (here I think non-quoted means non-escaped)
    // 2. Single-quoted, beginning with ' and ending with the first subsequent
    //    non-quoted '
    //    (here I think non-quoted means non-escaped)
    // 3. Double-quoted verbatim, beginning with @" and ending with the first
    //    subsequent non-quoted "
    // 4. Single-quoted verbatim, beginning with @' and ending with the first
    //    subsequent non-quoted '
    // 5. Text block, beginning with |||, followed by optional whitespace and a
    //    new-line. The next non-blank line must be prefixed with some non-zero
    //    length whitespace W. The block ends at the first subsequent line that
    //    does not begin with W, and it is an error if this line does not contain
    //    some optional whitespace followed by |||. The content of the string is
    //    the concatenation of all the lines that began with W but with that
    //    prefix stripped. The line ending style in the file is preserved in the
    //    string. This form cannot be used in import statements.
    //
    // Note that double- and single-quoted strings are allowed to span multiple
    // lines.
    //
    // Verbatim strings eschew all of the normal string escaping; every character
    // in a verbatim string is processed literally, with the exception of doubled
    // end-quotes. Within a verbatim single-quoted string, '' is processed as ',
    // and a verbatim double-quoted string, "" is processed as ",

    string: ($) => {
      // https://stackoverflow.com/a/249937
      const double_quoted_string = /"(?:[^"\\]|\\.)*"/;
      const single_quoted_string = /'(?:[^'\\]|\\.)*'/;

      // modified form of the regex above, I wonder if the performance
      // of this regex can be improved
      const double_quoted_verbatim_string = /@"(?:[^"]|"".)*"/;
      const single_quoted_verbatim_string = /@'(?:[^']|''.)*'/;

      // TODO: write more tests
      text_block_string = seq(
        '|||',
        optional(/\s+/),
        '\n',
        // TODO: define external scanners to support the indentation here
        // http://tree-sitter.github.io/tree-sitter/creating-parsers#external-scanners
        // FIXME: this regex is just a placeholder
        /.*/,
        optional(/\s+/),
        '|||',
      );

      return token(
        choice(
          double_quoted_string,
          single_quoted_string,
          double_quoted_verbatim_string,
          single_quoted_verbatim_string,
          text_block_string,
        ),
      );
    },

    // As defined by [JSON](https://www.json.org/json-en.html)
    // but without the leading minus
    number: ($) => {
      const number_part = choice('0', /[1-9]\d*/);

      const fraction_part = seq('.', /\d+/);

      const exponent_part = seq(
        choice('e', 'E'),
        optional(choice('-', '+')),
        /\d+/,
      );

      const decimal_literal = seq(
        number_part,
        optional(fraction_part),
        optional(exponent_part),
      );

      return token(decimal_literal);
    },

    objinside: ($) =>
      choice(
        // FIXME:
        // This line
        seq($.member, repeat(seq(',', $.member)), optional(',')),
        seq(
          // and this line are ambiguous apparently
          repeat(seq($.objlocal, ',')),
          '[',
          $.expr,
          ']',
          ':',
          $.expr,
          optional(repeat(seq(',', $.objlocal))),
          optional(','),
          $.forspec,
          repeat(choice($.forspec, $.ifspec)),
        ),
      ),

    member: ($) => choice($.objlocal, $.assert, $.field),

    field: ($) =>
      choice(
        seq($.fieldname, optional('+'), $.visibility, $.expr),
        seq(
          $.fieldname,
          '(',
          optional($.params),
          ')',
          $.visibility,
          $.expr,
        ),
      ),

    visibility: () => choice(':', '::', ':::'),

    objlocal: ($) => seq('local', $.bind),

    forspec: ($) => seq('for', $.id, 'in', $.expr),

    ifspec: ($) => seq('if', $.expr),

    fieldname: ($) => choice($.id, $.string, seq('[', $.expr, ']')),

    assert: ($) => seq('assert', $.expr, optional(seq(':', $.expr))),

    bind: ($) =>
      choice(
        seq($.id, '=', $.expr),
        seq($.id, '(', optional($.params), ')', '=', $.expr),
      ),

    args: ($) =>
      choice(
        seq(
          $.expr,
          repeat(seq(',', $.expr)),
          repeat(seq(',', $.id, '=', $.expr)),
          optional(','),
        ),
        seq(
          $.id,
          '=',
          $.expr,
          repeat(seq(',', $.id, '=', $.expr)),
          optional(','),
        ),
      ),

    params: ($) =>
      seq($.param, repeat(seq(seq(',', $.param), optional(',')))),

    param: ($) => seq($.id, optional(seq('=', $.expr))),

    binaryop: ($) =>
      choice(
        '*',
        '/',
        '%',
        '+',
        '-',
        '<<',
        '>>',
        '<',
        '<=',
        '>',
        '>=',
        '==',
        '!=',
        'in',
        '&',
        '^',
        '|',
        '&&',
        '||',
      ),

    unaryop: ($) => choice('-', '+', '!', '~'),

    _comment: () =>
      token(
        choice(
          seq('#', /.*/),
          seq('//', /.*/),
          // https://stackoverflow.com/a/36328890
          seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
        ),
      ),
  },
});

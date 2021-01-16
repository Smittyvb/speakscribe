const { test, module } = QUnit;

window.addEventListener('load', function () {
  module('Utils', () => {
    module('fixBracketSpaces', () => {
      test('removes space between bracket and text', a => {
        a.equal(fixBracketSpaces('( '), '(');
        a.equal(fixBracketSpaces(' ( '), ' (');
        a.equal(fixBracketSpaces('( a'), '(a');
        a.equal(fixBracketSpaces(' ( a'), ' (a');
        a.equal(fixBracketSpaces(' [ a'), ' [a')
      });
      test('ignores text without open bracket', a => {
        a.equal(fixBracketSpaces('a) a'), 'a) a');
        a.equal(fixBracketSpaces('a ) a ) '), 'a ) a ) ');
      });
      test('doesn\'t change text with spaces already removed', a => {
        a.equal(fixBracketSpaces('('), '(');
        a.equal(fixBracketSpaces('(a'), '(a');
        a.equal(fixBracketSpaces('[a'), '[a');
        a.equal(fixBracketSpaces(' ('), ' (');
      });
    });
    module('fixGrammarSpaces', () => {
      test('removes spaces when needed', a => {
        a.equal(fixGrammarSpaces('This , is a test'), 'This, is a test');
        a.equal(fixGrammarSpaces('a . b'), 'a. b');
        a.equal(fixGrammarSpaces('1 . 2'), '1. 2');
      });
      test('dooes\'t change already correct text', a => {
        a.equal(fixGrammarSpaces('This is a test.'), 'This is a test.');
        a.equal(fixGrammarSpaces('This is a test. '), 'This is a test. ');
        a.equal(fixGrammarSpaces('This, is a test'), 'This, is a test');
      });
      test('handles ellipsis', a => {
        a.equal(fixGrammarSpaces('This is a test...'), 'This is a test...');
        a.equal(fixGrammarSpaces('This is a test ...'), 'This is a test...');
      });
      test('handles emoticons', a => {
        a.equal(fixGrammarSpaces(':)'), ':)');
        a.equal(fixGrammarSpaces(' :) '), ' :) ')
      });
    });
    module('fixColonSpaces', () => {
      test('removes spaces', a => {
        a.equal(fixColonSpaces('a : b'), 'a: b');
        a.equal(fixColonSpaces('123 :a'), '123:a');
        a.equal(fixColonSpaces('a : 5'), 'a: 5')
      });
      test('ignores emoticons', a => {
        a.equal(fixColonSpaces('I like to :) daily.'), 'I like to :) daily.');
        a.equal(fixColonSpaces('a :( b'), 'a :( b');
        a.equal(fixColonSpaces('a ;) b'), 'a ;) b');
        a.equal(fixColonSpaces('a :-) b'), 'a :-) b');
        a.equal(fixColonSpaces('a :-( b'), 'a :-( b');
      });
    });
    module('capitalizeText', () => {

    });
    module('addText', () => {

    });
    module('applyCommands', () => {

    });
    module('settings', () => {

    });
  })

  test('window.commands exists', a => {
    a.ok(window.commands);
  });

  module('multiple files', () => {

  });

  module('custom command runner', () => {

  });

  module('rtf', () => {

  });
});
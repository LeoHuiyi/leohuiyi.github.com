/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*
  The MIT License (MIT)
  Copyright (c) 2007-2013 Einar Lielmanis and contributors.
  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:
  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 CSS Beautifier
---------------
    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)
    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
        http://jsbeautifier.org/
    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);
    The options are (default in brackets):
        indent_size (4)                   — indentation size,
        indent_char (space)               — character to indent with,
        selector_separator_newline (true) - separate selectors with newline or
                                            not (e.g. "a,\nbr" or "a, br")
        end_with_newline (false)          - end with a newline
        newline_between_rules (true)      - add a new line after every css rule
    e.g
    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' ',
      'end_with_newline': false,
      'newline_between_rules': true
    });
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/

!function(){function a(b,c){function o(){return m=b.charAt(++l),m||""}function p(a){var c="",d=l;return a&&s(),c=b.charAt(l+1)||"",l=d-1,o(),c}function q(a){for(var c=l;o();)if("\\"===m)o();else{if(-1!==a.indexOf(m))break;if("\n"===m)break}return b.substring(c,l+1)}function r(a){var b=l,c=q(a);return l=b-1,o(),c}function s(){for(var a="";j.test(p());)o(),a+=m;return a}function t(){var a="";for(m&&j.test(m)&&(a=m);j.test(o());)a+=m;return a}function u(a){var c=l;for(a="/"===p(),o();o();){if(!a&&"*"===m&&"/"===p()){o();break}if(a&&"\n"===m)return b.substring(c,l)}return b.substring(c,l)+m}function v(a){return b.substring(l-a.length,l).toLowerCase()===a}function w(){for(var a=0,c=l+1;c<b.length;c++){var d=b.charAt(c);if("{"===d)return!0;if("("===d)a+=1;else if(")"===d){if(0==a)return!1;a-=1}else if(";"===d||"}"===d)return!1}return!1}function B(){z++,x+=y}function C(){z--,x=x.slice(0,-d)}c=c||{},b=b||"",b=b.replace(/\r\n|[\r\u2028\u2029]/g,"\n");var d=c.indent_size||4,e=c.indent_char||" ",f=void 0===c.selector_separator_newline?!0:c.selector_separator_newline,g=void 0===c.end_with_newline?!1:c.end_with_newline,h=void 0===c.newline_between_rules?!0:c.newline_between_rules,i=c.eol?c.eol:"\n";"string"==typeof d&&(d=parseInt(d,10)),c.indent_with_tabs&&(e="    ",d=1),i=i.replace(/\\r/,"\r").replace(/\\n/,"\n");var m,j=/^\s+$/,l=-1,n=0,x=b.match(/^[\t ]*/)[0],y=new Array(d+1).join(e),z=0,A=0,D={};D["{"]=function(a){D.singleSpace(),E.push(a),D.newLine()},D["}"]=function(a){D.newLine(),E.push(a),D.newLine()},D._lastCharWhitespace=function(){return j.test(E[E.length-1])},D.newLine=function(a){E.length&&(a||"\n"===E[E.length-1]||D.trim(),E.push("\n"),x&&E.push(x))},D.singleSpace=function(){E.length&&!D._lastCharWhitespace()&&E.push(" ")},D.preserveSingleSpace=function(){L&&D.singleSpace()},D.trim=function(){for(;D._lastCharWhitespace();)E.pop()};for(var E=[],F=!1,G=!1,H=!1,I="",J="";;){var K=t(),L=""!==K,M=-1!==K.indexOf("\n");if(J=I,I=m,!m)break;if("/"===m&&"*"===p()){var N=0===z;(M||N)&&D.newLine(),E.push(u()),D.newLine(),N&&D.newLine(!0)}else if("/"===m&&"/"===p())M||"{"===J||D.trim(),D.singleSpace(),E.push(u()),D.newLine();else if("@"===m){D.preserveSingleSpace(),E.push(m);var O=r(": ,;{}()[]/='\"");O.match(/[ :]$/)&&(o(),O=q(": ").replace(/\s$/,""),E.push(O),D.singleSpace()),O=O.replace(/\s$/,""),O in a.NESTED_AT_RULE&&(A+=1,O in a.CONDITIONAL_GROUP_RULE&&(H=!0))}else"#"===m&&"{"===p()?(D.preserveSingleSpace(),E.push(q("}"))):"{"===m?"}"===p(!0)?(s(),o(),D.singleSpace(),E.push("{}"),D.newLine(),h&&0===z&&D.newLine(!0)):(B(),D["{"](m),H?(H=!1,F=z>A):F=z>=A):"}"===m?(C(),D["}"](m),F=!1,G=!1,A&&A--,h&&0===z&&D.newLine(!0)):":"===m?(s(),!F&&!H||v("&")||w()?":"===p()?(o(),E.push("::")):E.push(":"):(G=!0,E.push(":"),D.singleSpace())):'"'===m||"'"===m?(D.preserveSingleSpace(),E.push(q(m))):";"===m?(G=!1,E.push(m),D.newLine()):"("===m?v("url")?(E.push(m),s(),o()&&(")"!==m&&'"'!==m&&"'"!==m?E.push(q(")")):l--)):(n++,D.preserveSingleSpace(),E.push(m),s()):")"===m?(E.push(m),n--):","===m?(E.push(m),s(),f&&!G&&1>n?D.newLine():D.singleSpace()):"]"===m?E.push(m):"["===m?(D.preserveSingleSpace(),E.push(m)):"="===m?(s(),m="=",E.push(m)):(D.preserveSingleSpace(),E.push(m))}var P="";return x&&(P+=x),P+=E.join("").replace(/[\r\n\t ]+$/,""),g&&(P+="\n"),"\n"!=i&&(P=P.replace(/[\n]/g,i)),P}a.NESTED_AT_RULE={"@page":!0,"@font-face":!0,"@keyframes":!0,"@media":!0,"@supports":!0,"@document":!0},a.CONDITIONAL_GROUP_RULE={"@media":!0,"@supports":!0,"@document":!0},"function"==typeof define&&define.amd?define([],function(){return{css_beautify:a}}):"undefined"!=typeof exports?exports.css_beautify=a:"undefined"!=typeof window?window.css_beautify=a:"undefined"!=typeof global&&(global.css_beautify=a)}();

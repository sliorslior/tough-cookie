#!/usr/bin/env node
/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';
var fs = require('fs');
var punycode = require('punycode');

fs.readFile('./public_suffix_list.dat', 'utf8', function(err,string) {
  if (err) {
    throw err;
  }
  var lines = string.split("\n");
  process.nextTick(function() {
    processList(lines);
  });
});

var index = {};

var COMMENT = new RegExp('//.+');
function processList(lines) {
  while (lines.length) {
    var line = lines.shift();
    line = line.replace(COMMENT,'').trim();
    if (!line) {
      continue;
    }
    addToIndex(index,line);
  }

  var w = fs.createWriteStream('./lib/pubsuffix.js',{
    flags: 'w',
    encoding: 'utf8',
    mode: parseInt('644',8)
  });
  w.on('end', process.exit);
  w.write("/****************************************************\n");
  w.write(" * AUTOMATICALLY GENERATED by generate-pubsuffix.js *\n");
  w.write(" *                  DO NOT EDIT!                    *\n");
  w.write(" ****************************************************/\n\n");

  w.write('"use strict";\n');
  w.write("var punycode = require('punycode');\n\n");
  w.write('var index;\n');

  w.write("module.exports.getPublicSuffix = ");
  w.write(getPublicSuffix.toString());
  w.write(";\n\n");

  w.write("// The following generated structure is used under the MPL version 2.0\n");
  w.write("// See public-suffix.txt for more information\n\n");
  w.write("index = module.exports.index = Object.freeze(\n");
  w.write(JSON.stringify(index));
  w.write(");\n\n");
  w.write("// END of automatically generated file\n");

  w.end();
}

function addToIndex(index,line) {
  var prefix = '';
  if (line.replace(/^(!|\*\.)/)) {
    prefix = RegExp.$1;
    line = line.slice(prefix.length);
  }
  line = prefix + punycode.toASCII(line);

  if (line.substr(0,1) == '!') {
    index[line.substr(1)] = false;
  } else {
    index[line] = true;
  }
}

// include the licence in the function since it gets written to pubsuffix.js
function getPublicSuffix(domain) {
  /*!
   * Copyright (c) 2015, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   */
  if (!domain) {
    return null;
  }
  if (domain.match(/^\./)) {
    return null;
  }
  var asciiDomain = punycode.toASCII(domain);
  var converted = false;
  if (asciiDomain !== domain) {
    domain = asciiDomain;
    converted = true;
  }
  if (index[domain]) {
    return null;
  }

  domain = domain.toLowerCase();
  var parts = domain.split('.').reverse();

  var suffix = '';
  var suffixLen = 0;
  for (var i=0; i<parts.length; i++) {
    var part = parts[i];
    var starstr = '*'+suffix;
    var partstr = part+suffix;

    if (index[starstr]) { // star rule matches
      suffixLen = i+1;
      if (index[partstr] === false) { // exception rule matches (NB: false, not undefined)
        suffixLen--;
      }
    } else if (index[partstr]) { // exact match, not exception
      suffixLen = i+1;
    }

    suffix = '.'+partstr;
  }

  if (index['*'+suffix]) { // *.domain exists (e.g. *.kyoto.jp for domain='kyoto.jp');
    return null;
  }

  suffixLen = suffixLen || 1;
  if (parts.length > suffixLen) {
    var publicSuffix = parts.slice(0,suffixLen+1).reverse().join('.');
    return converted ? punycode.toUnicode(publicSuffix) : publicSuffix;
  }

  return null;
}

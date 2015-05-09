var _ = require('lodash');
var csv = require('oh-csv');

var fs = require('fs');
var Transform = require('stream').Transform;

var filter = new Transform({objectMode: true});

var header;

filter._transform = function(row, unused, cb) {
  var data;

  if (header === undefined) {
    header = row;
    this.push(row);
  } else {
    data = _.zipObject(header, row);

    if(data.AgeYear == '999') {
      data.AgeYear = '';
    }

    [ 'A', 'B', 'C', 'D' ].forEach(function(letter) {
      var value = data['Injury' + letter];
      if(value == '12/28/0887 12:00:00 AM'
        || value == '01/02/0111 12:00:00 AM') {
        data['Injury' + letter] = '';
      }
    });

    [ 'A', 'B', 'C', 'D' ].forEach(function(letter) {
      value = data['Cause' + letter];
      if(value == '888') {
        data['Cause' + letter] = '';
      }
    });

    [
      'OtherCause',
      'OtherInjury',
      'Part2_CauseA',
      'Part2_InjuryA',
      'Part2_CauseB',
      'Part2_InjuryB'
    ].forEach(function(attr) {
      if(data[attr] == '888') {
        data[attr] = '';
      }
    });

    this.push(_.values(data));
  }

  cb();
};

var parser = new csv.Parser();
var encoder = new csv.Encoder();

fs.createReadStream('sources/causes-of-death.csv')
  .pipe(parser)
  .pipe(filter)
  .pipe(encoder)
  .pipe(fs.createWriteStream('causes-of-death.csv'));

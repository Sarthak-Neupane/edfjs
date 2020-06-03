
'use strict';

var utils = require('./utils');
var toString = utils.toString;

function Channel(self) {
  self = self || {};
  self.fields = {
    label: [toString, 16],
    channel_type: [toString, 80],
    physical_dimension: [toString, 8],
    physical_minimum:	[Number, 8],
    physical_maximum: [Number, 8],
    digital_minimum: [Number, 8],
    digital_maximum: [Number, 8],
    prefiltering: [toString, 80],
    num_samples_per_record: [Number, 8],
    reserved: [toString, 32]
  };
  var scale = null;
  var offset = null;

  function digital2physical(d) {
    return scale * (d + offset);
  }

  function init(num_records, record_duration) {
    if (self.num_samples_per_record == null) {
      console.error("Error: allocate_blob called on uninitialized channel.");
      return null;
    }
    self.blob = new Float32Array(num_records*self.num_samples_per_record);
    scale = (this.physical_maximum - this.physical_minimum) /
                 (this.digital_maximum  - this.digital_minimum);
    offset = this.physical_maximum / scale - this.digital_maximum;
    self.sampling_rate = self.num_samples_per_record/record_duration;
  }

  function set_record(record, digi) {
    var start = record*self.num_samples_per_record;
    for (var i=0; i < self.num_samples_per_record; i++) {
      self.blob[start+i] = digital2physical(digi[i]);
    }
  }

  function get_physical_samples(t0, dt, n) {
    n = n || dt*self.sampling_rate;
    var start = t0*self.sampling_rate;
    return self.blob.slice(start, start+n);
  }

  self.set_record = set_record;
  self.get_physical_samples = get_physical_samples;
  self.digital2physical = digital2physical;
  self.init = init;

  return self;
}

module.exports = Channel;

/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * 
 * Copyright (c) 2017 Sony Global Education, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';
var debug = require('debug')('koovble');

const BLE_OPTS = {
  BTS01: {
    service_id: '55df0001a9b011e3a5e2000190f08f1e',
    characteristic_tx: '55df0002a9b011e3a5e2000190f08f1e',
    characteristic_rx: '55df0003a9b011e3a5e2000190f08f1e'
  },
  BTS01_GPIO: {
    service_id: '55df0001a9b011e3a5e2000190f08f1e',
    characteristic_tx: '55df8001a9b011e3a5e2000190f08f1e',
    characteristic_rx: '55df8001a9b011e3a5e2000190f08f1e'
  }
};

const KoovBle = (() => {
  if (process.platform === 'win32') {
    /*
     * THe following check must be same as the one in
     * noble-uwp/index.js.
     */
    const os = require('os');
    const ver = os.release().split('.').map(Number);
    if (!(ver[0] > 10 ||
          (ver[0] === 10 && ver[1] > 0) ||
          (ver[0] === 10 && ver[1] === 0 && ver[2] >= 15063))) {
      // BLE is not supported for this version.
      return null;
    }
  }
  const noble_device = (() => {
    try {
      return require('noble-device');
    } catch (e) {
      debug('failed to require noble-device', e);
      return null;
    }
  })();
  if (!noble_device) {
    // BLE is not supported on this device.
    return null;
  }
  let ble = function(peripheral) {
    noble_device.call(this, peripheral);
  };
  ble.SCAN_UUIDS = [BLE_OPTS.BTS01.service_id];
  noble_device.Util.inherits(ble, noble_device);
  ble.prototype.writeGPIO = function(data, done) {
    this.writeDataCharacteristic(BLE_OPTS.BTS01_GPIO.service_id,
                                 BLE_OPTS.BTS01_GPIO.characteristic_tx,
                                 data, done);
  };
  ble.prototype.readGPIO = function(done) {
    this.readDataCharacteristic(BLE_OPTS.BTS01_GPIO.service_id,
                                BLE_OPTS.BTS01_GPIO.characteristic_rx,
                                done);
  };
  ble.prototype.write = function(data, done) {
    this.writeDataCharacteristic(BLE_OPTS.BTS01.service_id,
                                 BLE_OPTS.BTS01.characteristic_tx,
                                 data, done);
  };
  let listener = null;
  ble.prototype.read = function(done) {
    this.notifyCharacteristic(BLE_OPTS.BTS01.service_id,
                              BLE_OPTS.BTS01.characteristic_rx,
                              true, done, function(err) {
                                debug('notify callback', err);
                                listener = done;
                              });
  };
  ble.prototype.stopReading = function(done) {
    if (!listener) {
      return done();
    }
    this.notifyCharacteristic(BLE_OPTS.BTS01.service_id,
                              BLE_OPTS.BTS01.characteristic_rx,
                              false, listener, function(err) {
                                debug('notify stop callback', err, listener);
                                listener = null;
                                done();
                                debug('notify callback', err);
                              });
  };
  ble.BLE_OPTS = BLE_OPTS;
  return ble;
})();

module.exports = {
    KoovBle: KoovBle
};

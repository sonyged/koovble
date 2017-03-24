'use strict';
var debug = require('debug')('koovdev_device');

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
    return null;
  }
  const noble_device = require('noble-device');
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
  ble.prototype.read = function(done) {
    this.notifyCharacteristic(BLE_OPTS.BTS01.service_id,
                              BLE_OPTS.BTS01.characteristic_rx,
                              true, done, function(err) {
                                debug('notify callback', err);
                              });
  };
  return ble;
})();
KoovBle.BLE_OPTS = BLE_OPTS;

module.exports = {
    KoovBle: KoovBle
};
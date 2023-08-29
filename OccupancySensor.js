const { Service, Characteristic } = require('homebridge');

class OccupancySensor {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.service = new Service.OccupancySensor(this.config.name);

    // Initialize occupancy as not detected
    this.service.getCharacteristic(Characteristic.OccupancyDetected)
      .setValue(Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  }

  // Method to update the occupancy status
  updateOccupancy(isOccupied) {
    const status = isOccupied ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
                              : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;

    this.service.getCharacteristic(Characteristic.OccupancyDetected)
      .setValue(status);
  }

  getServices() {
    return [this.service];
  }
}

module.exports = OccupancySensor;
const OccupancySensor = require('./OccupancySensor');
const UniFiController = require('./UniFiController');

let Service, Characteristic;

module.exports = (api) => {
  Service = api.hap.Service;
  Characteristic = api.hap.Characteristic;

  api.registerAccessory('homebridge-unifi-presence', 'UniFiOccupancySensor', UniFiOccupancySensor);
};

class UniFiOccupancySensor {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.unifiController = new UniFiController(this.config.unifi);

    this.sensors = [];

    this.config.people.forEach((person, index) => {
      // Generate a unique subtype for each sensor based on its index
      const subtype = `sensor-${index}`;
      const sensor = new OccupancySensor(log, person, Service, Characteristic, subtype);
      this.sensors.push(sensor);
    });

    this.startPolling();
  }

  async startPolling() {
    try {
      await this.unifiController.login();
    } catch (error) {
      this.log.error(`Failed to start polling due to login error: ${error}`);
      return;
    }

    setInterval(async () => {
      try {
        const clientDevices = await this.unifiController.getClientDevices();

        this.sensors.forEach(sensor => {
          const isOccupied = this.checkOccupancy(sensor.config.detectionType, sensor.config.filter, clientDevices);
          sensor.updateOccupancy(isOccupied, Characteristic);
        });

      } catch (error) {
        this.log.error(`Polling error: ${error}`);
      }
    }, 10000);  // Poll every 10 seconds
  }

  checkOccupancy(detectionType, filter, clientDevices) {
    // Actual logic to determine if a client device matches the filter
    return clientDevices.some(device => 
      (detectionType === 'MAC' && device.mac === filter) || 
      (detectionType === 'HOSTNAME' && device.hostname === filter)
    );
  }

  getServices() {
    return this.sensors.map(sensor => sensor.getServices()).flat();
  }
}

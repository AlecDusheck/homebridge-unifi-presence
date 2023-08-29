const Unifi = require('node-unifi');

class UniFiController {
  constructor(config) {
    this.controller = new Unifi.Controller(config);
    this.retryWait = 0; // Time in milliseconds to wait before next login attempt
  }

  async login() {
    try {
      await this.controller.login(config.username, config.password);
      this.retryWait = 0; // Reset retry wait time on successful login
    } catch (error) {
      console.error(`Failed to log in to UniFi Controller: ${error}`);
      this.retryWait += 5000; // Increase wait time by 5 seconds
      await new Promise(resolve => setTimeout(resolve, this.retryWait));
      throw error;
    }
  }

  async getClientDevices() {
    try {
      if (!this.session) {
        await this.login();
      }
      const clientData = await this.controller.getClientDevices();
      return clientData;
    } catch (error) {
      console.error(`Failed to get client devices: ${error}`);
      await this.login(); // Re-login on all errors
      return await this.getClientDevices();
    }
  }
}

module.exports = UniFiController;

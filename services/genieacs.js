class GenieACSService {
  constructor(url, user, password) {
    this.url = url;
    this.user = user;
    this.password = password;
  }

  // Método placeholder para evitar erro se for chamado
  async getDevice(id) {
    return { id, status: "mock_device" };
  }
}

module.exports = GenieACSService;

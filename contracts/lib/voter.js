class Voter {
  constructor(voterId, registrarId, firstname, lastname) {
    if (this.validateVoter(voterId) && this.validateRegistrar(registrarId)) {
      this.voterId = voterId;
      this.registrarId = registrarId;
      this.firstname = firstname;
      this.lastname = lastname;
      this.ballotCreated = false;
      this.type = "voter";

      if (this.__isContract) {
        delete this.__isContract;
      }
      if (this.name) {
        delete this.name;
      }
      return this;
    } else if (!this.validateVoter(voterId)) {
      throw new Error('the voterId is not valid.');
    } else {
      throw new Error('the registrarId is not valid.');
    }
  }

  async validateVoter(voterId) {
    if (voterId) return true;
    return false
  }

  async validateRegistrar(registrarId) {
    if (registrarId) return true;
    return false
  }
}

module.exports = Voter;
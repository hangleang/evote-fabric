class Election {
  constructor(name, mandate, country, year, startDate, endDate) {
    this.electionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (this.validateElection(this.electionId)) {
      this.name = name;
      this.mandate = mandate;
      this.country = country;
      this.year = year;
      this.startDate = startDate;
      this.endDate = endDate
      this.type = "election";

      if (this.__isContract) {
        delete this.__isContract;
      }
      return this;
    } else {
      throw new Error('the electionId is not valid.');
    }
  }

  async validateElection(electionId) {
    if (electionId) return true;
    return false;
  }
}

module.exports = Election;
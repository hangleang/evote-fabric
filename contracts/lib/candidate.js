class Candidate {
  constructor(_ctx, candidateId, description) {
    this.candidateId = candidateId;
    this.description = description;
    this.count = 0;
    this.type = "candidate";

    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;
  }
}

module.exports = Candidate;
class Ballot {
  constructor(ctx, candidates, election, voterId) {
    if (this.validateBallot(ctx, voterId)) {
      this.candidates = candidates;
      this.voterId = voterId;
      this.election = election;
      this.ballotCast = false;
      this.ballotId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.type = "ballot";

      if (this.__isContract) delete this.__isContract;
      if (this.name) delete this.name;
      return this;
    } else {
      console.log('a ballot has already been created for this voter');
      throw new Error ('a ballot has already been created for this voter');
    }
  }

  async validateBallot(ctx, voterId) {
    const buffer = await ctx.stub.getState(voterId);

    if (!!buffer && buffer.length > 0) {
      let voter = JSON.parse(buffer.toString());

      if (voter.ballotCreated) {
        console.log("ballot has already been created for this voter")
        return false;
      } else {
        return true
      }
    } else {
      console.log('This ID is not registered to vote.');
      return false;
    }
  }
}

module.exports = Ballot;
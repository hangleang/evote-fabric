'use strict';

// Import Fabric SDK
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');

// import local entitys and assets for evote
const Ballot = require('./ballot.js');
const Election = require('./election.js');
const Candidate = require('./candidate.js');
const Voter = require('./voter.js');
const Utils = require('./utils.js');

// constant to election data
const electionDataPath = path.join(process.cwd(), './lib/data/electionData.json');
const electionDataJson = fs.readFileSync(electionDataPath, 'utf8');
const electionData = JSON.parse(electionDataJson);

// constant to parties data
const candidateDataPath = path.join(process.cwd(), './lib/data/candidateData.json');
const candidateDataJson = fs.readFileSync(candidateDataPath, 'utf8');
const candidateData = JSON.parse(candidateDataJson).data;

class EvoteContract extends Contract {
    async init(ctx) {
        console.log('EvoteContract:init() was called!');

        let voters = [];
        let candidates = [];
        let elections = [];
        let election;

        // create 2 dump voters
        const voter1 = new Voter('v1', '123', 'Sok', 'San');
        const voter2 = new Voter('v2', '234', 'Sao', 'Som');

        voters.push(voter1); voters.push(voter2);

        // then, add those voters to update world state for checking registered voter
        await ctx.stub.putState(voter1.voterId, Buffer.from(JSON.stringify(voter1)));
        await ctx.stub.putState(voter2.voterId, Buffer.from(JSON.stringify(voter2)));

        // query current election state before create a new one
        let currentElection = JSON.parse(await this.queryByObjectType(ctx, 'election'));

        if (currentElection.length === 0) {
            let startDate = new Date(2022, 6, 5);
            let endDate = new Date(2022, 6, 6);

            // create new election and update to array of elections
            election = new Election(electionData.name, electionData.mandate, electionData.country, election.year, startDate, endDate);
            elections.push(election);

            await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
        } else {
            election = currentElection[0];
        }

        // add party data to parties array and update world state with partyId
        for(let i=0; i<candidateData.length; i++) {
            const candidate = new Candidate(ctx, candidateData[i].id, candidateData[i].description);
            candidates.push(candidate);

            await ctx.stub.putState(candidate.candidateId, Buffer.from(JSON.stringify(candidate)));
        }

        // generate a ballot for each of these registered voters
        for(let i=0; i<voters.length; i++) {
            if (!voters[i].ballot) {
                await this.generateBallot(ctx, candidates, election, voters[i]);
            } else {
                console.log(`this voter ${voters[i].voterId} already have ballot`);
            }
        }

        return voters;
    }

    async generateBallot(ctx, cadidates, election, voter) {
    // create new ballot with cadidates, election and attach the voterId
        const ballot = new Ballot(ctx, cadidates, election, voter.voterId);

        // update properties of voter
        voter.ballot = ballot.ballotId;
        voter.ballotCreated = true;

        // update/add world state data of voter and ballot with updated/created object
        await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));
        await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));
    }

    async createVoter(ctx, args) {
    // parse arguments
        args = JSON.parse(args);

        // create new voter object
        let voter = new Voter(args.voterId, args.registrarId, args.firstname, args.lastname);

        // query current election state before create a new one
        let currentElection = JSON.parse(await this.queryByObjectType(ctx, 'election'));

        // in condition of empty election
        if (currentElection.length === 0) {
            return {
                error: 'no election available, Run the init() function first.'
            };
        }
        currentElection = currentElection[0];

        // get all candidates from ctx - then, generate a ballot from the voter.
        const candidates = JSON.parse(await this.queryByObjectType(ctx, 'candidate'));
        await this.generateBallot(ctx, candidates, currentElection, voter);

        return {
            msg: `voter with voterID ${voter.voterId} has been registered in blockchain or world state`
        };
    }

    async deleteAsset(ctx, assetId) {
        const isExists = await Utils.isAssetExists(ctx, assetId);

        if (!isExists) {
            throw new Error(`The asset with assetID ${assetId} does not exist on earth.`);
        }

        await ctx.stub.deleteState(assetId);
    }

    async castVote(ctx, args) {
        args = JSON.parse(args);

        //get the picked candidate, and check if election is exists
        const pickedCandidateId = args.picked;
        const isElectionExist = await Utils.isAssetExists(ctx, args.electionId);

        if (isElectionExist) {
            const electionAsBytes = await ctx.stub.getState(args.electionId);
            const election = JSON.parse(electionAsBytes);
            const voterAsBytes = await ctx.stub.getState(args.voterId);
            const voter = JSON.parse(voterAsBytes);

            // check whether your vote has been cast
            if (voter.ballotCast) {
                return {
                    error: `The voter with voterID ${voter.voterId} has already cast the vote ballot.`
                };
            }

            const now = new Date();
            const startDate = Date.parse(election.startDate);
            const endDate = Date.parse(election.endDate);

            // check if now in election period
            if (now > startDate && now < endDate) {
                const isPickedExist = await Utils.isAssetExists(ctx, pickedCandidateId);

                // check if picked candidate exist
                if (!isPickedExist) {
                    return {
                        error: `The candidate with candidateID ${pickedCandidateId} does not exist on the earth.`
                    };
                }

                // get pick candidate object from ctx
                const pickedCandidateAsBytes = await Utils.getAsset(ctx, pickedCandidateId);
                const pickedCandidate = JSON.parse(pickedCandidateAsBytes);

                // increase 1 voice on the picked candidate count - then, update the picked candidate state
                pickedCandidate.count++;
                let res = await ctx.stub.putState(pickedCandidateId, Buffer.from(JSON.stringify(pickedCandidate)));
                console.log('PutState:candidate', res);

                voter.ballotCast = true;
                voter.picked = args.picked;

                res = await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));
                console.log('PutState:voter', res);
                return voter;
            } else {
                return {
                    error: 'The election is not yet available or has been expired.'
                };
            }
        } else {
            return {
                error: `the election with electionID ${args.electionId} does not exist!`
            };
        }
    }

    async queryAll(ctx) {
        const queryString = {
            selector: {}
        };

        return await Utils.queryWithQueryString(ctx, JSON.stringify(queryString));
    }

    async queryByObjectType(ctx, objectType) {
        const queryString = {
            selector: {
                type: objectType
            }
        };

        return await Utils.queryWithQueryString(ctx, JSON.stringify(queryString));
    }
}

module.exports = {
    EvoteContract
};

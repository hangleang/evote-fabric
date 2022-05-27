<template>
  <div class="posts">
    <h1>បោះសន្លឹកឆ្នោត</h1>
    <li v-for="(cadidate, index) in cadidateData.data" v-bind:key="index">
      <input type="radio" id="{{ index }}" value={{ candidate.id }} v-model="picked">
      <label for={{ index }}>{{ cadidate.id }}</label>
      <br>
    </li>
    <br>
    <span v-if="picked">
      បានជ្រើសរើស៖
      <b>{{ picked }}</b>
    </span>
    <br>
    <br>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="castBallot">
      <!-- <input type="text" value="2sww593dc034wb2twdk91r" v-model="input.electionId"  >
      <br>-->
      <input type="text" v-model="input.voterId" placeholder="បញ្ចូលលេខសម្គាល់អ្នកបោះឆ្នោត">
      <br>
      <input type="submit" value="បោះឆ្នោត">
      <br>
    </form>

    <br>
    <span v-if="response">
      <b>{{ response }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import cadidateData from "@/data/candidateData.json";

export default {
  name: "response",
  data() {
    return {
      cadidateData,
      input: {},
      picked: null,
      castResponse: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async castBallot() {
      await this.runSpinner();

      const electionRes = await PostsService.queryWithQueryString('election');

      let electionId = electionRes.data[0].Key;

      console.log("picked: ");
      console.log(this.picked);
      console.log("voterId: ");
      console.log(this.input.voterId);
      this.castResponse = null;

 

      //error checking for making sure to vote for a valid party
      if (this.picked === null ) {
        console.log('this.picked === null')

        let response = "You have to pick a party to vote for!";
        this.castResponse = response;
        await this.hideSpinner();
      
      } else if (this.input.voterId === undefined) {
        console.log('this.voterId === undefined')

        let response = "You have to enter your voterId to cast a vote!";
        this.castResponse = response;
        await this.hideSpinner();

      } else {

        const apiResponse = await PostsService.castBallot(
          electionId,
          this.input.voterId,
          this.picked
        );

        console.log('apiResponse: &&&&&&&&&&&&&&&&&&&&&&&');
        console.log(apiResponse);

        if (apiResponse.data.error) {
          this.castResponse = apiResponse.data.error;
          await this.hideSpinner();
        } else if (apiResponse.data.message) {
          this.castResponse= `Could not find voter with voterId ${this.input.voterId}
            in the state. Make sure you are entering a valid voterId`;
          await this.hideSpinner();
        } 
        else {
          let response = `Successfully recorded vote for ${this.picked} party 
            for voter with voterId ${apiResponse.data.voterId}. Thanks for 
            doing your part and voting!`;

          this.castResponse = response;

          console.log("cast ballot");
          console.log(this.input);
          await this.hideSpinner();
        }
      }
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>
<template>
  <div class="posts">
    <h1>{{ electionData.name }} អាណត្តិទី {{ electionData.mandate }} នៅ {{ electionData.country }} ឆ្នាំ {{ electionData.year }}</h1>
    <h3>ប្រសិនបើអ្នកបានចុះឈ្មោះបោះឆ្នោតរួចហើយ សូមបញ្ចូលលេខសម្គាល់អ្នកបោះឆ្នោតរបស់អ្នកខាងក្រោម</h3>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="validateVoter">
      <input type="text" v-model="loginData.voterId" placeholder="សូមបញ្ចូលលេខសម្គាល់អ្នកបោះឆ្នោត">
      <br>

      <input type="submit" value="Login">
      <br>
      <br>
      <span v-if="loginReponse">
        <b>{{ loginReponse.data }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Otherwise, fill out the form below to register!</h3>
    <form v-on:submit="registerVoter">
      <input type="text" v-model="registerData.voterId" placeholder="បញ្ចូលលេខសម្គាល់អ្នកបោះឆ្នោត">
      <br>
      <input type="text" v-model="registerData.registrarId" placeholder="បញ្ចូលលេខសម្គាល់អ្នកចុះឈ្មោះ">
      <br>
      <input type="text" v-model="registerData.firstName" placeholder="បញ្ចូលនាម">
      <br>
      <input type="text" v-model="registerData.lastName" placeholder="បញ្ចូលត្រកូល">
      <br>
      <input type="submit" value="ចុះឈ្មោះ">
    </form>
    <br>
    <span v-if="registerReponse">
      <b>{{ registerReponse.data }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

import electionData from "@/data/electionData.json";
export default {
  name: "response",
  data() {
    return {
      electionData,
      loginData: {},
      registerData: {},
      registerReponse: {
        data: ""
      },
      loginReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async registerVoter() {
      await this.runSpinner();
      const apiResponse = await PostsService.registerVoter(
        this.registerData.voterId,
        this.registerData.registrarId,
        this.registerData.firstName,
        this.registerData.lastName
      );
      console.log(apiResponse);
      this.registerReponse = apiResponse;
      await this.hideSpinner();
    },
    async validateVoter() {
      await this.runSpinner();
      if (!this.loginData.voterId) {
        console.log("!thislogin");
        let response = 'Please enter a VoterId';
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateVoter(
          this.loginData.voterId
        );
        console.log("apiResponse");
        console.log(apiResponse.data);
        if (apiResponse.data.error) {
          // console.log(apiResponse);
          console.log(apiResponse.data.error);
          this.loginReponse = apiResponse.data.error;
        } else {
          this.$router.push("castBallot");
        }
        console.log(apiResponse);
        this.loginReponse = apiResponse;
        // this.$router.push('castBallot')
        await this.hideSpinner();
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
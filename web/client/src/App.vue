<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <p>
      <router-link to="/">Home</router-link>&nbsp;          
      <router-link to="/queryAll">QueryAll</router-link>
    </p>
    <router-link to="/queryByKey">Query by Key</router-link>&nbsp;
    <router-link to="/standingPoll">Standing Poll</router-link>&nbsp;
    
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.chart-wrapper {
  width: 100%;
  height: 700px;
}
.echarts {
  width: 100%;
  height: 100%;
}
#loader {
  position:fixed;
  padding-top: 250px;
}
.chart-wrapper {
  position:fixed;
  padding-left:32%;
}
</style>

new Vue({
  el: "#app",
  data: {},
  methods: {},
  computed: {},
  watch: {},
  // The beforeCreate hook runs at the very initialization of your component
  // data has not been made reactive, and events have not been set up yet
  beforeCreate() { },
  // able to access reactive data and events
  // templates and Virtual DOM have not yet been mounted or rendered
  created() { },
  // runs right before the initial render happens
  // after the template or render functions have been compiled
  beforeMount() { },
  // full access to the reactive component, templates, and rendered DOM
  mounted() { },
  // runs after data changes on your component and the update cycle begins
  // before the DOM is patched and re-rendered
  beforeUpdate() { },
  // runs after data changes on your component and the DOM re-renders
  updated() { },
  beforeDestroy() { },
  destroyed() { }
});
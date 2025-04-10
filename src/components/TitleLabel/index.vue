<template>
  <div class="TitleLabel">
    {{ title }}
  </div>
</template>

<script>
export default {
  name: 'TitleLabel',
  props: {
    title: {
      type: String,
      default: 'title'
    }
  },
  data () {
    return {
      // your data here
    }
  },
}
</script>

<style lang="scss" scoped>
.TitleLabel {
  border-left: 3px solid #409eff;
  padding-left: 10px;
  font-size: 18px;
  font-weight: bold;
  height: 26px;
  line-height: 26px;
}
</style>

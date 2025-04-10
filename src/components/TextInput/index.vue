<template>
  <div class="TextInput" :style="{width: `calc(100% - ${width})`}">
    <div class="label">{{ label }}</div>
    <component
        :is="isEditing ? 'el-input' : 'span'"
        ref="input"
        :value="value"
        @click="editText"
        @input="onInput"
        @blur="doneEditing"
        @keyup.enter="doneEditing"
    >{{ value }}
    </component>
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '100px'
    }
  },
  data () {
    return {
      isEditing: false
    }
  },
  methods: {
    editText () {
      this.isEditing = true
      this.$nextTick(() => {
        // 确保输入框聚焦
        this.$refs.input.focus()
      })
    },
    doneEditing () {
      this.isEditing = false
    },
    onInput(value){
      this.$emit('update:value', value)
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created () {
    // your code here
  },
  mounted () {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.TextInput {
  //width: calc(100% - 100px);
  display: flex;
  align-items: center;
  .label{
    margin-right: 20px;
  }
  .el-input{
  }
  span{
    padding: 0 10px;
    width: 100%;
    line-height: 40px;
    cursor: text;
    height: 40px;
    &:hover{
      background-color: #FCF9CA;
    }
  }
}
</style>

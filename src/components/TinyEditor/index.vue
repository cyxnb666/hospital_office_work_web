<template>
  <textarea ref="textarea"></textarea>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import 'tinymce/skins/ui/oxide/skin'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons'
import 'tinymce/models/dom/model'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/code'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/image'

import { uploadOSS } from '@/utils/uploadOSS'

export default {
  components: {},
  props: {
    value: String
  },
  data () {
    return {
      editor: null
    }
  },
  watch: {
    value: {
      handler () {
        this.setValue(this.value)
      },
      immediate: true
    }
  },
  mounted () {
    const self = this

    tinymce
      .init({
        // 允许上传的图片类型
        images_file_types: 'jpg,jpeg,png',

        // 图片上传大小限制(bytes)
        images_max_size: 5 * 1024 * 1024, // 5MB

        // 允许拖拽上传
        dragdrop_drop_image: true,

        // 视频相关配置
        media_live_embeds: true,
        media_alt_source: false,
        media_dimensions: false,
        // paste_data_images: false,
        statusbar: false,
        // 设置媒体上传按钮的文字
        media_upload_label: '上传视频',
        target: this.$refs.textarea,
        ui_mode: 'split',
        content_css: '/hospital_office_work_web/tinymce/skins/ui/oxide/content.css',
        language_url: '/hospital_office_work_web/tinymce/langs/zh_CN.js',
        language: 'zh_CN',
        plugins:
          'lists link anchor code wordcount image table visualchars visualblocks searchreplace preview pagebreak nonbreaking media insertdatetime fullscreen directionality autosave autolink advlist',
        toolbar: [
          'undo redo removeformat | bold italic underline strikethrough superscript subscript backcolor forecolor | numlist bullist | blocks | searchreplace fullscreen',
          'fontfamily fontsize fontsizeselect fontsizeinput | alignleft aligncenter alignright alignjustify lineheight outdent indent | link unlink image media | preview code'
        ],
        font_size_formats:
          '9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 42px 48px 72px',
        font_size_input_default_unit: 'px',
        images_upload_handler: (blobInfo, progress) => {
          return this.uploadImage(blobInfo, progress)
        },
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === 'media') {
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', '.mp4')
            input.onchange = function () {
              const file = this.files[0]

              // 检查文件大小
              const isLt100M = file.size / 1024 / 1024 < 100
              if (!isLt100M) {
                this.$message.error('视频大小不能超过 100MB!')
                return
              }

              // 上传视频
              uploadOSS(file)
                .then(res => {
                  callback(`${self.ossBaseUrl}${res.fileName}`)
                })
                .catch(() => {
                  self.$message.error('视频上传失败')
                })
            }
            input.click()
          }
        },
        height: 500,
        promotion: false
      })
      .then(([editor]) => {
        this.editor = editor
        this.setValue(this.value)
        editor.on('change keyup undo redo', () => {
          this.$emit('input', editor.getContent())
        })
      })
  },
  beforeDestroy () {
    this.clearEditorContent()
    this.editor?.destroy()
  },
  computed: {
    ossBaseUrl () {
      try {
        const ossConfig = JSON.parse(sessionStorage.getItem('ossConfig'))
        if (ossConfig) {
          return `https://${ossConfig.bucketName}.${ossConfig.endpoint.replace(/\/+$/, '')}/${ossConfig.catalogue.replace(/\/+$/, '')}/`
        }
        return ''
      } catch (err) {
        console.error('解析 OSS 配置失败:', err)
        return ''
      }
    }
  },
  methods: {
    setValue (val) {
      const oldValue = this.editor?.getContent()
      if (typeof val === 'string' && val !== oldValue) {
        this.editor?.setContent(val)
      }
    },
    uploadImage (blobInfo, progress) {
      return new Promise((resolve, reject) => {
        const file = blobInfo.blob()
        uploadOSS(file) // OSS上传
          .then(res => {
            progress(100)
            resolve(`${this.ossBaseUrl}${res.fileName}`)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    clearEditorContent () {
      if (this.editor) {
        this.editor.setContent('') // 清空编辑器内容
      }
    }
  }
}
</script>

<style>
.tox-tinymce-aux {
  z-index: 10000 !important;
}

.tox .tox-number-input .tox-input-wrapper {
  display: none !important;
}

.tox-statusbar__branding {
  display: none !important;
}
</style>

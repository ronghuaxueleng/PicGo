<template>
  <div id="picgo-setting">
    <div class="view-title">
      PicGo设置
    </div>
    <el-row class="setting-list">
      <el-col :span="16" :offset="4">
        <el-row>
        <el-form
          label-width="160px"
          label-position="right"
          size="small"
        >
          <el-form-item
            label="打开配置文件"
          >
            <el-button type="primary" round size="mini" @click="openFile('data.json')">点击打开</el-button>
          </el-form-item>
          <el-form-item
            label="设置日志文件"
          >
            <el-button type="primary" round size="mini" @click="openLogSetting">点击设置</el-button>
          </el-form-item>
        </el-form>
        </el-row>
      </el-col>
    </el-row>
    <el-dialog
      title="设置日志文件"
      :visible.sync="logFileVisible"
      :modal-append-to-body="false"
    >
      <el-form
        label-position="right"
        label-width="100px"
      >
        <el-form-item
          label="日志文件"
        >
          <el-button type="primary" round size="mini" @click="openFile('picgo.log')">点击打开</el-button>
        </el-form-item>
        <el-form-item
          label="日志记录等级"
        >
          <el-select
            v-model="form.logLevel"
            multiple
            collapse-tags
          >
            <el-option
              v-for="(value, key) of logLevel"
              :key="key"
              :label="value"
              :value="key"
              :disabled="handleLevelDisabled(key)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancelLogLevelSetting" round>取消</el-button>
        <el-button type="primary" @click="confirmLogLevelSetting" round>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import pkg from 'root/package.json'
import { IConfig } from 'picgo'
import { PICGO_OPEN_FILE } from '#/events/constants'
import {
  ipcRenderer
} from 'electron'
import { Component, Vue } from 'vue-property-decorator'
const customLinkRule = (rule: string, value: string, callback: (arg0?: Error) => void) => {
  if (!/\$url/.test(value)) {
    return callback(new Error('必须含有$url'))
  } else {
    return callback()
  }
}

@Component({
  name: 'picgo-setting'
})
export default class extends Vue {
  form: ISettingForm = {
    miniWindowOntop: false,
    logLevel: ['all']
  }

  logFileVisible = false
  customLink = {
    value: '$url'
  }

  proxy = ''
  npmRegistry = ''
  npmProxy = ''
  rules = {
    value: [
      { validator: customLinkRule, trigger: 'blur' }
    ]
  }

  logLevel = {
    all: '全部-All',
    success: '成功-Success',
    error: '错误-Error',
    info: '普通-Info',
    warn: '提醒-Warn',
    none: '不记录日志-None'
  }

  server = {
    port: 36677,
    host: '127.0.0.1',
    enable: true
  }

  version = pkg.version
  os = ''

  created () {
    this.os = process.platform
    this.initData()
  }

  async initData () {
    const config = (await this.getConfig<IConfig>())!
    if (config !== undefined) {
      const settings = config.settings || {}
      const picBed = config.picBed
      this.form.miniWindowOntop = settings.miniWindowOntop || false
      this.form.logLevel = this.initLogLevel(settings.logLevel || [])

      this.customLink.value = settings.customLink || '$url'
      this.proxy = picBed.proxy || ''
      this.npmRegistry = settings.registry || ''
      this.npmProxy = settings.proxy || ''
      this.server = settings.server || {
        port: 36677,
        host: '127.0.0.1',
        enable: true
      }
    }
  }

  initLogLevel (logLevel: string | string[]) {
    if (!Array.isArray(logLevel)) {
      if (logLevel && logLevel.length > 0) {
        logLevel = [logLevel]
      } else {
        logLevel = ['all']
      }
    }
    return logLevel
  }

  openFile (file: string) {
    ipcRenderer.send(PICGO_OPEN_FILE, file)
  }

  openLogSetting () {
    this.logFileVisible = true
  }

  confirmLogLevelSetting () {
    if (this.form.logLevel.length === 0) {
      return this.$message.error('请选择日志记录等级')
    }
    this.saveConfig({
      'settings.logLevel': this.form.logLevel
    })
    const successNotification = new Notification('设置日志', {
      body: '设置成功'
    })
    successNotification.onclick = () => {
      return true
    }
    this.logFileVisible = false
  }

  async cancelLogLevelSetting () {
    this.logFileVisible = false
    let logLevel = await this.getConfig<string | string[]>('settings.logLevel')
    if (!Array.isArray(logLevel)) {
      if (logLevel && logLevel.length > 0) {
        logLevel = [logLevel]
      } else {
        logLevel = ['all']
      }
    }
    this.form.logLevel = logLevel
  }

  handleLevelDisabled (val: string) {
    const currentLevel = val
    let flagLevel
    const result = this.form.logLevel.some(item => {
      if (item === 'all' || item === 'none') {
        flagLevel = item
      }
      return (item === 'all' || item === 'none')
    })
    if (result) {
      if (currentLevel !== flagLevel) {
        return true
      }
    } else if (this.form.logLevel.length > 0) {
      if (val === 'all' || val === 'none') {
        return true
      }
    }
    return false
  }
}
</script>
<style lang='stylus'>
.el-message
  left 60%
.view-title
  .el-icon-document
    cursor pointer
    transition color .2s ease-in-out
    &:hover
      color #49B1F5
#picgo-setting
  .sub-title
    font-size 14px
  .setting-list
    height 360px
    box-sizing border-box
    overflow-y auto
    overflow-x hidden
  .setting-list
    .el-form
      label
        line-height 32px
        padding-bottom 0
        color #eee
      .el-button-group
        width 100%
        .el-button
          width 50%
      .el-input__inner
        border-radius 19px
      .el-radio-group
        margin-left 25px
      .el-switch__label
        color #eee
        &.is-active
          color #409EFF
      .el-icon-question
        font-size 20px
        float right
        margin-top 9px
        color #eee
        cursor pointer
        transition .2s color ease-in-out
        &:hover
          color #409EFF
      .el-checkbox-group
        label
          margin-right 30px
          width 100px
      .el-checkbox+.el-checkbox
        margin-right 30px
        margin-left 0
      .confirm-button
        width 100%
  .server-dialog
    .notice-text
      color: #49B1F5
    .el-dialog__body
      padding-top: 0
    .el-form-item
      margin-bottom: 10px
</style>

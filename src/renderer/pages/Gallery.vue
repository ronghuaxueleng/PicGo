<template>
  <div id="gallery-view">
    <div class="view-title">
      相册 - {{ filterList.length }} <i class="el-icon-caret-bottom" @click="toggleHandleBar" :class="{'active': handleBarActive}"></i>
    </div>
    <transition name="el-zoom-in-top">
      <el-row v-show="handleBarActive">
        <el-col :span="20" :offset="2">
          <el-row class="handle-bar" :gutter="16">
            <el-col :span="12">
            </el-col>
          </el-row>
          <el-row class="handle-bar" :gutter="16">
            <el-col :span="12">
              <el-input
                placeholder="搜索"
                size="mini"
                v-model="searchText">
                <i slot="suffix" class="el-input__icon el-icon-close" v-if="searchText" @click="cleanSearch" style="cursor: pointer"></i>
              </el-input>
            </el-col>
            <el-col :span="4">
              <div class="item-base delete round" :class="{ active: isMultiple(choosedList)}" @click="multiRemove">
                删除
              </div>
            </el-col>
            <el-col :span="4">
              <div class="item-base all-pick round" :class="{ active: filterList.length > 0}" @click="toggleSelectAll">
                {{ isAllSelected ? '取消' : '全选' }}
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </transition>
    <el-row class="gallery-list" :class="{ small: handleBarActive }">
      <el-col :span="20" :offset="2">
        <el-row :gutter="16">
          <gallerys
            :images="filterList"
            :index="idx"
            @close="handleClose"
            :options="options"
          ></gallerys>
          <el-col :span="6" v-for="(item, index) in filterList" :key="item.id" class="gallery-list__img">
            <div
              class="gallery-list__item"
              @click="zoomImage(index)"
            >
              <img v-lazy="item.imgUrl" class="gallery-list__item-img">
            </div>
            <div class="gallery-list__tool-panel">
              <i class="el-icon-edit-outline" @click="openDialog(item)"></i>
              <i class="el-icon-delete" @click="remove(item.id)"></i>
              <el-checkbox v-model="choosedList[item.id]" class="pull-right" @change="(val) => handleChooseImage(val, index)"></el-checkbox>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-dialog
      :visible.sync="dialogVisible"
      title="修改图片URL"
      width="500px"
      :modal-append-to-body="false"
    >
      <el-input v-model="imgInfo.imgUrl"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmModify">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
// @ts-ignore
import gallerys from 'vue-gallery'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IResult } from '@picgo/store/dist/types'
import {
  ipcRenderer
} from 'electron'
@Component({
  name: 'gallery',
  components: {
    gallerys
  }
})
export default class extends Vue {
  images: ImgInfo[] = []
  idx: null | number = null
  options = {
    titleProperty: 'fileName',
    urlProperty: 'imgUrl',
    closeOnSlideClick: true
  }

  dialogVisible = false
  imgInfo = {
    id: '',
    imgUrl: ''
  }

  choosedList: IObjT<boolean> = {}
  lastChoosed: number = -1
  isShiftKeyPress: boolean = false
  searchText = ''
  handleBarActive = false

  mounted () {
    document.addEventListener('keydown', this.handleDetectShiftKey)
    document.addEventListener('keyup', this.handleDetectShiftKey)
  }

  handleDetectShiftKey (event: KeyboardEvent) {
    if (event.key === 'Shift') {
      if (event.type === 'keydown') {
        this.isShiftKeyPress = true
      } else if (event.type === 'keyup') {
        this.isShiftKeyPress = false
      }
    }
  }

  get filterList () {
    return this.getGallery()
  }

  get isAllSelected () {
    const values = Object.values(this.choosedList)
    if (values.length === 0) {
      return false
    } else {
      return this.filterList.every(item => {
        return this.choosedList[item.id!]
      })
    }
  }

  getGallery (): ImgInfo[] {
    return this.images
  }

  @Watch('filterList')
  handleFilterListChange () {
    this.clearChoosedList()
  }

  handleChooseImage (val: boolean, index: number) {
    if (val === true) {
      this.handleBarActive = true
      if (this.lastChoosed !== -1 && this.isShiftKeyPress) {
        const min = Math.min(this.lastChoosed, index)
        const max = Math.max(this.lastChoosed, index)
        for (let i = min + 1; i < max; i++) {
          const id = this.filterList[i].id!
          this.$set(this.choosedList, id, true)
        }
      }
      this.lastChoosed = index
    }
  }

  clearChoosedList () {
    this.isShiftKeyPress = false
    Object.keys(this.choosedList).forEach(key => {
      this.choosedList[key] = false
    })
    this.lastChoosed = -1
  }

  zoomImage (index: number) {
    this.idx = index
    this.changeZIndexForGallery(true)
  }

  changeZIndexForGallery (isOpen: boolean) {
    if (isOpen) {
      // @ts-ignore
      document.querySelector('.main-content.el-row').style.zIndex = 101
    } else {
      // @ts-ignore
      document.querySelector('.main-content.el-row').style.zIndex = 10
    }
  }

  handleClose () {
    this.idx = null
    this.changeZIndexForGallery(false)
  }

  remove (id: string) {
    this.$confirm('此操作将把该图片移出相册, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const file = await this.$$db.getById(id)
      await this.$$db.removeById(id)
      ipcRenderer.send('removeFiles', [file])
      const obj = {
        title: '操作结果',
        body: '删除成功'
      }
      const myNotification = new Notification(obj.title, obj)
      myNotification.onclick = () => {
        return true
      }
    }).catch((e) => {
      console.log(e)
      return true
    })
  }

  openDialog (item: ImgInfo) {
    this.imgInfo.id = item.id!
    this.imgInfo.imgUrl = item.imgUrl as string
    this.dialogVisible = true
  }

  cleanSearch () {
    this.searchText = ''
  }

  isMultiple (obj: IObj) {
    return Object.values(obj).some(item => item)
  }

  toggleSelectAll () {
    const result = !this.isAllSelected
    this.filterList.forEach(item => {
      this.$set(this.choosedList, item.id!, result)
    })
  }

  multiRemove () {
    const multiRemoveNumber = Object.values(this.choosedList).filter(item => item).length
    if (multiRemoveNumber) {
      this.$confirm(`将在相册中移除刚才选中的 ${multiRemoveNumber} 张图片，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const files: IResult<ImgInfo>[] = []
        const imageIDList = Object.keys(this.choosedList)
        for (let i = 0; i < imageIDList.length; i++) {
          const key = imageIDList[i]
          if (this.choosedList[key]) {
            const file = await this.$$db.getById<ImgInfo>(key)
            if (file) {
              files.push(file)
              await this.$$db.removeById(key)
            }
          }
        }
        this.clearChoosedList()
        this.choosedList = {} // 只有删除才能将这个置空
        const obj = {
          title: '操作结果',
          body: '删除成功'
        }
        ipcRenderer.send('removeFiles', files)
        const myNotification = new Notification(obj.title, obj)
        myNotification.onclick = () => {
          return true
        }
      }).catch(() => {
        return true
      })
    }
  }

  toggleHandleBar () {
    this.handleBarActive = !this.handleBarActive
  }
}
</script>
<style lang='stylus'>
.view-title
  color #eee
  font-size 20px
  text-align center
  margin 10px auto
  .sub-title
    font-size 14px
  .el-icon-caret-bottom
    cursor: pointer
    transition all .2s ease-in-out
    &.active
      transform: rotate(180deg)
#gallery-view
  height 100%
.item-base
  background #2E2E2E
  text-align center
  padding 5px 0
  cursor pointer
  font-size 13px
  transition all .2s ease-in-out
  height: 28px
  box-sizing: border-box
  &.copy
    cursor not-allowed
    background #49B1F5
    &.active
      cursor pointer
      background #1B9EF3
      color #fff
  &.delete
    cursor not-allowed
    background #F47466
    &.active
      cursor pointer
      background #F15140
      color #fff
  &.all-pick
    cursor not-allowed
    background #69C282
    &.active
      cursor pointer
      background #44B363
      color #fff
#gallery-view
  position relative
  .round
    border-radius 14px
  .pull-right
    float right
  .gallery-list
    height 360px
    box-sizing border-box
    padding 8px 0
    overflow-y auto
    overflow-x hidden
    position absolute
    top: 38px
    transition all .2s ease-in-out .1s
    width 100%
    &.small
      height: 287px
      top: 113px
    &__img
      height 150px
      position relative
      margin-bottom 16px
    &__item
      width 100%
      height 120px
      transition all .2s ease-in-out
      cursor pointer
      margin-bottom 8px
      overflow hidden
      display flex
      &-fake
        position absolute
        top 0
        left 0
        opacity 0
        width 100%
        z-index -1
      &:hover
        transform scale(1.1)
      &-img
        width 100%
        object-fit fill
    &__tool-panel
      color #ddd
      i
        cursor pointer
        transition all .2s ease-in-out
        &.el-icon-document
          &:hover
            color #49B1F5
        &.el-icon-edit-outline
          &:hover
            color #69C282
        &.el-icon-delete
          &:hover
            color #F15140
  .handle-bar
    color #ddd
    margin-bottom 10px
  .el-input__inner
    border-radius 14px
</style>

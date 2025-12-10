/**
 * tap-action 组件
 * 防止快速点击，支持节流和禁用状态
 * 可应用于button、card等可点击组件
 *
 * 使用场景：
 * 1. 防止 catchtap 快速触发，PC 端某些情况可能存在问题
 * 2. 提供 300ms 的节流间隔，避免频繁操作导致数据重复提交
 */

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    // button 或 card，可自定义，具体样式由父组件控制
    type: {
      type: String,
      value: 'button'
    },
    // icon 图标，可选，button 类型时生效
    icon: {
      type: String,
      value: ''
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      value: false
    },
    // 节流间隔时间，单位 ms，0 表示不节流
    throttle: {
      type: Number,
      value: 300
    }
  },
  data: {
    _isTapping: false
  },
  methods: {
    onTap(e) {
      if (this.properties.disabled) return

      // 节流处理
      const throttle = this.properties.throttle
      if (throttle > 0) {
        if (this.data._isTapping) return
        this.setData({ _isTapping: true })
        setTimeout(() => {
          this.setData({ _isTapping: false })
        }, throttle)
      }

      this.triggerEvent('tap', e.detail)
    }
  }
})

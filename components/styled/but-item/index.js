Component({
  properties: {
    disabled: {
      type: Boolean,
      value: false
    },
    imgDisabled: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      value: ''
    },
    badge: {
      type: Boolean,
      value: false
    },
    count: {
      type: Number,
      value: 0
    },
    text: {
      type: String,
      value: ''
    },
    imgUrl: {
      type: String,
      value: ''
    },
    rotate: {
      type: Boolean,
      value: false
    },
    pattern: {
      type: String,
      value: 'base'
    },
    color: {
      type: String,
      value: '#FFFFFF'
    }
  },
  data: {

  },
  methods: {
    change() {
      if (!this.data.disabled) {
        this.triggerEvent('change', { type: this.data.type })
      }
    }
  }
})
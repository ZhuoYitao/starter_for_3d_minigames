import "./js/wxhelper";
import './js/adaptor/index'
// import './js/adaptorSimple/index'
// import './js/adaptorSimplified/index'
// import "./demo_babylon/game"

wx.loadSubpackage({
  name: 'demo', // name 可以填 name 或者 root
  success: function(res) {
    // 分包加载成功后通过 success 回调
  },
  fail: function(res) {
    // 分包加载失败通过 fail 回调
  }
})
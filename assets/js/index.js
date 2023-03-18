$(function () {
    getUserInfo()

    var layer = layui.layer

    // 点击按钮，实现退出的功能
    $('#btnLogout').on('click', function () {
        layer.confirm('确认退出登录吗?', {icon: 3, title:'提示'}, function(index){
            //do something
            // 1. 清空本地存储的token
            localStorage.removeItem('token')
            // 2. 重新跳转到登录页面
            location.href = '/login.html'
            // 3. 关闭confirm 询问框
            layer.close(index);
          })
    })
})


// 获取用户的基本信息
function getUserInfo() {
    $.ajax({
        method: 'GET',
        url: '/my/userinfo',
        // headers请求头的配置对象
        // headers: {
        //     Authorization: localStorage.getItem('token') || ''
        // },
        success: function (res) {
            if (res.status !== 0) {
                return layui.layer.msg('获取用户信息失败!')
            }
            // 调用renderAvatar 函数来渲染用户头像
            renderAvatar(res.data)
        },
        // 无论成功还是失败，都会调用complete函数
        // complete: function (res) {
        //     // 在complete回调函数中，可以通过res.responseJSON拿到服务器响应回来的数据
        //     if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
        //         // 1.强制清空token
        //         localStorage.removeItem('token')
        //         // 2.强制跳转到登录页面
        //         location.href = '/login.html'
        //     }
        // }
    })
}

// 渲染用户的头像
function renderAvatar(user) {
    // 1 获取用户的名称
    var name = user.nickname || user.username
    // 2 渲染欢迎的文本
    $('#welcome').html(`欢迎&nbsp;&nbsp;${name}`)
    // 3 按需渲染用户的头像
    if (user.user_pic !== null) {
        // 渲染图片头像
        $('.layui-nav-img')
        .attr('src', user.user_pic)
        .show()
        $('.text-avatar').hide()
    } else {
        // 渲染文本头像
        var first = name[0].toUpperCase()
        $('.text-avatar')
        .html(first)
        .show()
        $('.layui-nav-img').hide()
    }
}

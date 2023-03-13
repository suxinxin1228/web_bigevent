$(function () {
    // 点击“去注册账号”的链接
    $('#link_reg').on('click', function () {
        $('.login-box').hide()
        $('.reg-box').show()
    })
    // 点击“去登录”的链接
    $('#link_login').on('click', function () {
        $('.login-box').show()
        $('.reg-box').hide()
    })

    // 从layui中获取form对象
    var form = layui.form
    // 从layui中获取layer对象
    var layer = layui.layer

    // 调用form.verify()函数来自定义校验规则
    form.verify({
        // 自定义一个叫pwd的校验规则
        pwd: [/^[\S]{6,12}$/,'密码必须6到12位，且不能出现空格'] ,
        repwd: function (value) {
            // 通过形参可以获取到再次确认密码框的值
            // 还需要获取密码框的值,对二者进行判断
            // .reg-box [name=password] 属性选择器
            var pwd = $('.reg-box [name=password]').val()
            if (value !== pwd) {
                return '两次密码不一致'
            }
        }
        
    })

    // 监听注册页面的表单提交行为
    $('#form_reg').on('submit', function (e) {
        e.preventDefault()
        var data = {username: $('#form_reg [name=username]').val(), password: $('#form_reg [name=password]').val()}
        $.post('/api/reguser', data, function (res) {
            if (res.status !== 0) {
                return layer.msg(res.message)
            }
            layer.msg('注册成功, 请登录!');
            // 模拟用户的点击行为, 自动触发"去登陆"的点击事件,自动切换到登录页面
            $('#link_login').click()
        })
    })/

    // 监听登录页面的表单提交行为
    $('#form_login').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            url: '/api/login',
            method: 'POST',
            // 快速获取表单中的数据
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message)
                }
                layer.msg('登录成功!')
                // 将登陆成功后,得到的token字符串,保存到localStorage中
                localStorage.setItem('token', res.token)
                // 跳转到后台主页
                location.href = '/index.html'

            }
        })
    })
})
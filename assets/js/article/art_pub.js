$(function () {
    let layer = layui.layer
    let form = layui.form

    initCate()
    // 初始化富文本编辑器
    initEditor()


    // 定义加载文章类别的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('初始化文章分类失败!')
                }
                // 调用模板引擎,渲染文章类别的下拉选择框
                let htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 调用form.render()方法,让layui再次渲染表单结构
                form.render()
            }
        })
    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')
  
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }
  
    // 3. 初始化裁剪区域
    $image.cropper(options)

    // 为选择封面的按钮绑定点击事件
    $('#btnChooseImage').on('click', function () {
        $('#coverFile').click()
    })

    // 监听文件选择框的change事件
    $('#coverFile').on('change', function (e) {
        let files = e.target.files
        if (files.length === 0) {
            return layer.msg('请选择图片!')
        }
        // 1. 拿到用户选择的文件
        let file = e.target.files[0]
        // 2. 根据选择的文件，创建一个对应的 URL 地址
        var newImgURL = URL.createObjectURL(file)
        // 3. 先销毁旧的裁剪区域，再重新设置图片路径，之后再创建新的裁剪区域：
        $image
        .cropper('destroy')      // 销毁旧的裁剪区域
        .attr('src', newImgURL)  // 重新设置图片路径
        .cropper(options)        // 重新初始化裁剪区域
    })

    // 定义文章的状态
    var state = '已发布'

    // 为存为草稿按钮,绑定点击事件
    $('#btnSave2').on('click', function () {
        state = '草稿'
    })

    // 为表单绑定submit事件
    $('#form-pub').on('submit', function (e) {
        e.preventDefault()
        // 基于form表单,快速创建一个FormData对象
        var fd = new FormData($(this)[0])
        // 将文章的发布状态,存到fd中
        fd.append('state', state)

        $image
        .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
            width: 400,
            height: 280
        })
        .toBlob(function(blob) {       // 将 Canvas 画布上的内容，转化为文件对象
            // 得到文件对象后，进行后续的操作
            fd.append('cover_img', blob)
            publishArticle(fd)
        })

    })

    // 定义发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意:如果向服务器提交的是FormData格式的数据
            // 必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('发布文章失败!')
                }
                layer.msg('发布文章成功!')
                // 文章发布成功后,跳转到文章列表页面
                location.href = '/article/art_list.html'
            }
        })
    }
})
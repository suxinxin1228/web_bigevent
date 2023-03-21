$(function () {
    let layer = layui.layer
    let form = layui.form

    initArtCateList()
    // 获取文章分类列表的数据
    function initArtCateList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
               var htmlStr = template('tpl-table', res)
               $('tbody').html(htmlStr)
            }
        })
    }

    let indexAdd = null
    // 为添加类别按钮绑定点击事件
    $('#btnAddCate').on('click', function () {
        indexAdd = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '添加文章类别',
            content: $('#dialog-add').html()
        })
    })

    // 通过事件委托，为form-add表单绑定submit事件
    $('body').on('submit', '#form-add', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    console.log(res);
                    return layer.msg('新增分类失败！')
                }
                initArtCateList()
                layer.msg('新增分类成功！')
                // 根据索引，关闭对应的弹出层
                layer.close(indexAdd)
                
            }
        })
    })
    let indexEdit = null
    // 通过事件委托，为编辑按钮绑定点击事件
    $('tbody').on('click' , '.btn-edit', function () {
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章类别',
            content: $('#dialog-edit').html()
        })
        let id = $(this).attr('data-id')
        // 发起请求获取对应id的数据
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function (res) {
                form.val('form-edit', res.data)
            }
        })
    })

    // 通过事件委托，为form-edit表单绑定submit事件
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新分类数据失败！')
                }
                layer.msg('更新分类数据成功！')
                initArtCateList()
                layer.close(indexEdit)
            }
        })
    })

    // 通过事件委托，为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function () {
        layer.confirm('确定删除?', {icon: 3, title:'提示'}, function(index){
            //do something
            let id = $(this).attr('data-id')
            $.ajax({
                method: 'GET',
                url: '/my/article/deletecate/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除分类失败！')
                    }
                    layer.msg('删除分类成功！')
                    initArtCateList()
                    layer.close(index);
                }
            })
          });
    })
    
})
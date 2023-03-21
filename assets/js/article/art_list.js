$(function () {
    let layer = layui.layer
    let form = layui.form
    let laypage = layui.laypage

    // 定义美化时间格式的过滤器
    template.defaults.imports.dataFormat = function (data) {
        let dt = new Date(data)

        let y = dt.getFullYear()
        let m = padZero(dt.getMonth() + 1)
        let d = padZero(dt.getDate())

        let hh = padZero(dt.getHours())
        let mm = padZero(dt.getMinutes())
        let ss = padZero(dt.getSeconds())

        return  y + '-' + m + '-' + d + '' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查询的参数对象，将来请求文章列表数据时，
    // 需要将请求的参数对象提交到服务器
    let q = {
        // 页码值，默认请求第一页的数据
        pagenum: 1,
        // 每页显示几条数据，，默认煤业显示两条数据
        pagesize: 2,
        // 文章分类的id
        cate_id: '',
        // 文章的发布状态
        state: ""
    }

    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎渲染页面的数据
                let htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败')
                }
                // 调用模板引擎渲染分类的可选项
                let htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 让layui重新渲染表单区域的ui结构
                form.render()
            }
        })
    }

    // 监听筛选表单的submit事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项的值
        let cate_id = $('[name=cate_id]').val()
        let state = $('[name=state]').val()
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件，重新渲染列表的数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        laypage.render({
            // 指定存放分页的容器
            elem: 'pageBox',
            // 总数据条数
            count: total,
            // 每页显示几条数据
            limit: q.pagesize,
            // 默认被选中的页码值
            curr: q.pagenum, 
            // 自定义分页的排版结构
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            // 每页显示几条数据的可选框
            limits: [2, 3, 5, 10],
            // 触发jump回调的方式有两种：
            // 1.点击页码的时候，会触发jump回调
            // 2.只要调用了laypage.render()方法，就会触发jump回调
            jump: function (obj, first) {
                // 注：如果是第一种方式触发的jump回调，first的值就为undefined
                // 如果是第二种方式触发的，first的值就为true
                // console.log(obj.curr);
                // 把最新的页码值，赋值给q这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新的每页显示几条数据,赋值给q这个查询参数对象中
                q.pagesize = obj.limit
                // 根据最新的q获取对应的列表数据，并渲染表格
                if (!first) {
                    initTable()
                } 
            }
        })
    }

    // 通过事件委托，为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function () {
        layer.confirm('确定删除?', {icon: 3, title:'提示'}, function(index){
            //do something
            // 获取删除按钮的个数
            let len = $('.btn-delete').length
            // 获取文章的id
            let id = $('.btn-delete').attr('data-id')
            // 询问用户是否要删除数据
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                    // 当数据删除完成后，需要判断当前页中，是否还有剩余的数据
                    // 如果没有剩余的数据了，需要让页码值-1
                    // 再重新调用initTable()
                    if (len === 1) {
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                    layer.close(index);
                }
            })
          });
    })

    let indexEdit = null
    // 通过事件委托，为编辑按钮绑定点击事件
    $('tbody').on('click', '.btn-edit', function () {
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章信息',
            content: $('#tpl-edit').html()
          }); 
        let id = $(this).attr('data-id')
        // 发起请求,拿到对应id的数据
        $.ajax({
            method: 'GET',
            url: '/my/article/' + id,
            success: function (res) {
                form.val('form-edit', res.data)
            }
        })
    })

    //通过事件委托，为form-edit表单绑定submit事件
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault()
        // 基于form表单,快速创建一个FormData对象
        let fd = new FormData($(this)[0])
        console.log(fd);
        // 发起请求,更新文章的信息
        $.ajax({
            method: 'POST',
            url: '/my/article/edit',
            data: fd,
            // 如果向服务器提交的是FormData格式的数据
            // 必须添加以下两个配置项
            contentType:false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新文章信息失败!')
                }
                layer.msg('更新文章信息成功!')
                initTable()
                layer.close(indexEdit)
            }
        })
    })

})
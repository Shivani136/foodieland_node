module.exports = (app) =>{
    const {
        upload ,
        createBlog ,
        getAllBlogs,
        getBlog,
        changeStatus,
        updateBlog,
        searchBlogs
    } = require('../controller/blog');

    const express = require('express');
     app.use(express.static(__dirname + '/public'));
     app.use('/blogs', express.static('blogs'));

     app.post('/api/addBlog',upload.any(),createBlog)
     app.get('/api/getAllBlog',getAllBlogs)
     app.get('/api/getBlog',getBlog)
     app.put('/api/statusChanged',changeStatus)
     app.put('/api/updateBlog',upload.any(),updateBlog)

     app.get('/api/searchBlog',searchBlogs)
}
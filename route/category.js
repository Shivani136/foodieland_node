module.exports = (app) =>{
    const {
        createCtegory,
        getAllCategory,
        getCategory,
        updateCategory,
        deleteCategory
    } = require('../controller/category');
    const {upload} = require('../middleware/uploadFiles.js')

    const express = require('express');
     app.use(express.static(__dirname + '/public'));
     app.use('/uploads', express.static('uploads'));

    app.post('/api/addCtegory',upload.single('image'),createCtegory);
    app.get('/api/getAllCategory',getAllCategory);
    app.get('/api/getCategory',getCategory);
    app.put('/api/updateCategory',upload.single('image'),updateCategory);
    app.delete('/api/deleteCategory',upload.none(),deleteCategory)
}
module.exports = (app) =>{
    const {
        upload ,
        createSitOptions ,
        getAllSitOptions,
        updateSitOptions,
        deleteSitOptions
    } = require('../controller/siteOption');

    const express = require('express');
     app.use(express.static(__dirname + '/public'));
     app.use('/logo', express.static('logo'));

     app.post('/api/addSitOptions',upload.single('logo'),createSitOptions)
     app.get('/api/getAllSitOptions',getAllSitOptions)
     app.put('/api/edit-SitOptions',upload.single('logo'),updateSitOptions)
     app.delete('/api/deleteSitOptions',upload.none(),deleteSitOptions)
}
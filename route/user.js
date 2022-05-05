module.exports = (app) => {
    const {
        upload,
        login,
        register,
        getAllUsers,
        deleteUser,
        updateUser,
        sendforgetPasswodMail,
        restPassword,
        changeStatus
    } = require('../controller/user');

    const express = require('express');
    app.use(express.static(__dirname + '/public'));
    app.use('/uploads', express.static('uploads'));

     app.post('/api/register',upload.single("Image"),register);
     app.post('/api/signIn',login)
     app.get('/api/getAllUsers',getAllUsers)
    //  app.delete('/api/deleteUser',upload.none(),deleteUser)
     app.put('/api/edit-user',upload.single("Image"),updateUser);
     app.post('/api/sendMail',sendforgetPasswodMail);
     app.put('/api/resetPassword',restPassword);

     app.put('/api/changeStatus',changeStatus)
}

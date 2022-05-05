module.exports = (app) =>{
    const {
        createRecipe,
        upload,
        getAllRecipes,
        getRecipes,
        updateRecipes,
        changeStatus,
        searchRecipes
    } = require('../controller/recipe')

    const express = require('express');
    app.use(express.static(__dirname + '/public'));
    app.use('/recipes', express.static('recipes'));

    app.post('/api/addRecipes',upload.fields([{name:'image',maxCount:1},{name:'video',maxCount:1}]),createRecipe);
    // app.post('/api/addRecipes',upload.any(),createRecipe)
    app.get('/api/getAllRecipes',getAllRecipes);
    app.get('/api/getRecipe',getRecipes)
    app.put('/api/editRecipe',upload.fields([{name:'image',maxCount:1},{name:'video',maxCount:1}]),updateRecipes)
    app.put('/api/recipesChangeStatus',changeStatus)
    app.get('/api/searcRecipe',searchRecipes)
}
module.exports = (app) =>{
    const {
        createRecipeMeta,
        upload,
        getAllRecipe,
        getOneRecipes,
        deleteRecipeMeta
    } = require('../controller/recipe_meta')

    const express = require('express');
    app.use(express.static(__dirname + '/public'));
    app.use('/recipes', express.static('recipes'));

   // app.post('/api/addRecipesMeta',upload.any(),createRecipeMeta);
    app.get('/api/v1/getallrecipes',getAllRecipe);

    app.get('/api/recipeDetails',getOneRecipes);
    app.delete('/api/deleteMeta',deleteRecipeMeta)
}
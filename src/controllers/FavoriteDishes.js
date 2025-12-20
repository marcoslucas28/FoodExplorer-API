const AppError = require("../utils/AppError")
const knex = require("../database/knex")

class FavoriteDishes {
    async create(req, res){
        const { dish_id } = req.params

        const { id: user_id } = req.user

        const dish = await knex("dishes").where({id: dish_id}).first()
        if(!dish) throw new AppError("Dish not found", 401);

        const favoriteExists = await knex("favoriteDishes").where({user_id: user_id}).andWhere({dish_id: dish_id})

        if(favoriteExists.length > 0){
            return res.status(201).json("Prato já está favoritado")
        }

        await knex("favoriteDishes").insert({
            user_id,
            dish_id
        })

        return res.status(201).json({
            "dishId": dish_id,
            "isFavorite": true
        })
        
    }

    async delete(req, res){
        const { dish_id } = req.params

        const { id: user_id } = req.user

        const favoriteExists = await knex("favoriteDishes").where({user_id: user_id}).andWhere({dish_id: dish_id})

        if(favoriteExists.length === 0){
            return res.status(201).json("Prato já não era favorito")
        }

        await knex("favoriteDishes").where({user_id: user_id, dish_id: dish_id}).delete()

        return res.status(201).json({
            "dishId": dish_id,
            "isFavorite": false
        })
    }

    async index(req, res){
        const { id } = req.user

        const favorites = await knex('favoriteDishes')
        .select([
        'dishes.id',
        'dishes.name',
        'dishes.image'
        ])
        .join('dishes', 'favoriteDishes.dish_id', 'dishes.id')
        .where('favoriteDishes.user_id', id)
        .orderBy('dishes.name')

        return res.json(favorites)
    }
}

module.exports = FavoriteDishes
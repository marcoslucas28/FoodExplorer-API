const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")
const knex = require("../database/knex")

class DishesController {
    //categories = ["meals", "desserts", "drinks"]

    async create(req, res){
        const { name, description, price, category, ingredients } = req.body
        const imageFileName = req.file.filename

        const categoryIsValid = ["meals", "desserts", "drinks"].includes(category) 

        if(!categoryIsValid){
            throw new AppError("Categoria invalída")
        }

        const diskStorage = new DiskStorage()

        const fileName = await diskStorage.saveFile(imageFileName)

        try {
            const [dish_id] = await knex('dishes').insert({
                name,
                description,
                image: fileName,
                price,
                category
            })

            const ingredientsInsert = ingredients.map(name => {
                return {
                    dish_id,
                    name
                }
            })

            await knex('ingredients').insert(ingredientsInsert)

            return res.status(201).json({dish_id})
        } catch (error) {
            console.log(error)
            return res.status(500).json({error: 'Internal server erro'})
        }
        
    }

    async delete(req, res){
        const { id } = req.params

        const dish = await knex('dishes').where({id}).first()

        const diskStorage = new DiskStorage()

        if(dish.image){
            await diskStorage.deleteFile(dish.image)
        }

        await knex('dishes').where({id}).delete()

        return res.json()
    }

    async update(req, res){
        const { name, description, price, category, ingredients  } = req.body
        const {id} = req.params
        const imageFileName = req.file.filename

        const diskStorage = new DiskStorage()
        
        const dish = await knex("dishes").where({id}).first()

        const categoryIsValid = ["meals", "desserts", "drinks"].includes(category) 

        if(!categoryIsValid){
            throw new AppError("Categoria invalída")
        }

        if(!dish.id){
            throw new AppError("Prato não encontrado")
        }

        await diskStorage.deleteFile(dish.image)
        const fileName = await diskStorage.saveFile(imageFileName)

        dish.name = name ?? dish.name
        dish.description = description ?? dish.description
        dish.price = price ?? dish.price
        dish.category = category ?? dish.category
        dish.image = fileName ?? dish.image


        try {
            const ingredientsInsert = ingredients.map(ingredient => {
                return{
                    dish_id: dish.id,
                    name: ingredient
                }
            })

            await knex("ingredients").where({dish_id: id}).delete()
            await knex('ingredients').insert(ingredientsInsert)

            await knex("dishes").where({id}).update(dish)

            return res.status(201).json("Prato atulizado")
        } catch (error) {
            console.log(error)
            return res.status(500).json({error: 'Internal server erro'})
        }

    }

    async index(req, res){
        const { category, name } = req.query

        let dishes

        try{

            if(name){
                dishes = await knex('dishes')
                .select('dishes.*')
                .leftJoin('ingredients', 'dishes.id', 'ingredients.dish_id')
                .where("dishes.category", category)
                .andWhere((builder) => {
                    builder.whereLike('dishes.name', `%${name}%`).orWhereLike('ingredients.name', `%${name}%`)
                }).groupBy('dishes.id').orderBy('dishes.name')
            }else {
                dishes = await knex('dishes').where({category}).groupBy('id').orderBy('name')
            }

            return res.json(dishes)
        } catch (error){
            console.log(error)
            return res.status(500).json({error: 'Internal server erro'})
        }
    }

    async show(req, res){
        const {id} = req.params

        const dish = await knex("dishes").where({id}).first()
        const ingredients = await knex("ingredients").where({dish_id: id}).orderBy("name")

        return res.json({
            ...dish,
            ingredients
        })
    }
}

module.exports = DishesController
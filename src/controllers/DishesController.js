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

        await knex('dishes').where({id}).delete()

        return res.json()
    }
}

module.exports = DishesController
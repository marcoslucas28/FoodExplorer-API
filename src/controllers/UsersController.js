const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError")

const sqliteConnection = require("../database/sqlite")

class UsersController {
    async create(req, res){
        const { name, email, password } = req.body

        const database = await sqliteConnection()

        const checkUserExists = await database.get('SELECT * FROM users WHERE email = (?)', [email])

        if(checkUserExists){
            throw new AppError("Este email, já está em uso")
        }

        const hashedPassword = await hash(password, 8)

        await database.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword])

        return res.status(201).json()
    }

    async update(req, res){
        const { name, email, password, oldPassword } = req.body
        const id = req.user.id

        const database = await sqliteConnection()

        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if(!user.id){
            throw new AppError("Usuário não encontrado")
        }

        const emailIsValid = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(emailIsValid && emailIsValid !== user.id){
            throw new AppError("Este e-mail já está em uso")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email
        
        if(password && !oldPassword){
            throw new AppError("Informe sua senha antiga para atualiza-la");
        }

        if(password && oldPassword){
            const checkOldPassword = await compare(oldPassword, user.password)

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere");
            }

            user.password = await hash(password, 8)
        }

        await database.run(`UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('now') WHERE id = ?`, [user.name, user.email, user.password, id])

        return res.json()
    }
}

module.exports = UsersController
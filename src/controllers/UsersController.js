/**
 * class UserController ( boa prática: no máximo 5 métodos )
 * index  - Método GET    - para listar vários registros
 * show   - Método GET    - para exibir um registro específico
 * create - Método POST   - para criar um registro
 * update - Método PUT    - para atualizar um registro
 * delete - Método DELETE - para remover um registro
 */

const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError")

const UserRepository = require("../repositories/UserRepository")
const sqliteConnection = require("../database/sqlite")

class UsersController{
  async create(req, res){
    const { name, email, password } = req.body
    
    const userRepository = new UserRepository()
    
    const checkUserExists = await userRepository.findByEmail(email)
    
    if(checkUserExists) {
      throw new AppError("Este email já está em uso.")
    }
    
    const hashedPassword = await hash(password, 8)

    console.log(`Nome: ${name} -- Email: ${email} -- Password: ${password}`)

    await userRepository.create({name, email, password: hashedPassword})

    return res.status(201).json()
  }

  async update(request, res){
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnection()
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])

    if(!user){
      throw new AppError("Usuário não encontrado.")
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError("Este e-mail já está em uso. " + `${userWithUpdatedEmail.id}-${user.id}`)
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if( password && !old_password ) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
    }

    if( password && old_password ) {
      const checkOldPassword = await compare(old_password, user.password)
      if(!checkOldPassword){
        throw new AppError("A senha antiga não confere")
      }
      user.password = await hash(password, 8)
    }

    await database.run(`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return res.status(200).json()
  }

}

module.exports = UsersController
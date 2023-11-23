const UserCreateService      = require("./UserCreateService")
const UserRepositoryInMemory = require("../repositories/UserRepositoryInMemory")
const AppError = require("../utils/AppError")


describe("UserCreateService", () => { //dica do professor: 1 describe por arquivo
  const userRepositoryInMemory = null
  const userCreateService = null

  beforeEach(() => {
    userRepositoryInMemory = new UserRepositoryInMemory()
    userCreateService = new UserCreateService(userRepositoryInMemory)
  });


  it("user should be created", async () => {
    const user = {
      name: "User Test",
      email: "user@test.com",
      password: "123"
    }

    const userCreated = await userCreateService.execute(user)

    console.log(userCreated)

    expect(userCreated).toHaveProperty("id")
  })

  it("user shouldn't be created because email already exists", async () => {

    const user1 = {
      name: "User Test 1",
      email: "user@test.com",
      password: "123"
    }
    const user2 = {
      name: "User Test 2",
      email: "user@test.com",
      password: "456"
    }

    await userCreateService.execute(user1)
    
    expect(async () => {
      await userCreateService.execute(user2)
    }).rejects.toEqual(new AppError("Este email já está em uso."))

    //OUTRA FORMA DE CODAR: await expect(userCreateService.execute(user2)).rejects.toEqual(new AppError("Este email já está em uso."))

  })

})
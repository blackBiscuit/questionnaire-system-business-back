import prisma from '../db/mysql'
import { RegisterUserInfo, LoginUser } from '../types/user'
export const registerService = async (user: RegisterUserInfo) => {
  const { email } = user
  const oldUser = await prisma.user.findUnique({
    where: { email }
  })

  if (oldUser) {
    return null
  }
  return await prisma.user.create({
    data: user
  })
}
export const loginService = async (user: LoginUser) => {
  const { email, password } = user
  const currentUser = await prisma.user.findUnique({
    where: { email, password }
  })
  console.log(currentUser)
  return currentUser
}

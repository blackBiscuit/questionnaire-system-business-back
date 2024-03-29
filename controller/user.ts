import { Context } from 'koa'
import md5 from 'md5'
import RandomStr from 'randomstring'
import { sign } from 'jsonwebtoken'
import { registerService, loginService, updateUserInfo } from '../service/user'
import { RegisterUserInfo, LoginUser } from '../types/user'
import { ErrorList } from '../const/code'
import { TOKEN_SECRET } from '../const'
import { sendEmail } from '../utils/email'
import { getUserInfo } from '../utils/user'
export const registerController = async (ctx: Context) => {
  const user = ctx.request.body as RegisterUserInfo
  try {
    const u = await registerService({ ...user, password: md5(user.password) })
    if (!u) {
      ctx.error(
        ErrorList.AlreadyRegistered.code,
        ErrorList.AlreadyRegistered.msg
      )
      return
    }
    const { username, email } = u
    ctx.success({
      username,
      email
    })
  } catch (error) {}
}
export const loginController = async (ctx: Context) => {
  const userInfo = {
    ...ctx.request.body,
    password: md5(ctx.request.body.password)
  } as LoginUser
  console.log(userInfo.password)
  const user = await loginService(userInfo)
  if (user) {
    const { email, username, id } = user
    const payload = {
      username,
      email,
      id
    }
    const token = sign(payload, TOKEN_SECRET, { expiresIn: '10h' })
    ctx.success({
      token,
      userInfo: {
        username,
        email
      }
    })
  } else {
    ctx.error(
      ErrorList.AccountPasswordNotMatch.code,
      ErrorList.AccountPasswordNotMatch.msg
    )
  }
}
export const userInfoController = async (ctx: Context) => {
  const { email, username } = getUserInfo(ctx)
  ctx.success({ username, email })
}
export const emailCodeController = async (ctx: Context) => {
  const { email } = ctx.request.body
  const codeStr = RandomStr.generate(6)
  sendEmail(email, codeStr)
  ctx.success({})
}
export const forgetPasswordController = async (ctx: Context) => {
  const user = ctx.request.body as RegisterUserInfo
  console.log('update', md5(user.password))
  try {
    const u = await updateUserInfo({
      email: user.email,
      username: user.username,
      password: md5(user.password)
    })
    const { username, email } = u
    ctx.success({
      username,
      email
    })
  } catch (error) {}
}

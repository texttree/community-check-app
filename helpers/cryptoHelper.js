const crypto = require('crypto')
const jwt = require('jsonwebtoken')

export const generateKeyAndIV = () => {
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  return { key, iv }
}

export const encryptToken = (token, key, iv) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encryptedToken = cipher.update(token, 'utf-8', 'hex')
  encryptedToken += cipher.final('hex')
  return encryptedToken
}

export const decryptToken = (encryptedToken, key, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decryptedToken = decipher.update(encryptedToken, 'hex', 'utf-8')
  decryptedToken += decipher.final('utf-8')
  return decryptedToken
}

// const generateAndStoreToken = async (userId, email) => {
//   console.log(userId, email, 5)

//   const token = jwt.sign({ sub: userId, name: email }, process.env.JWT_SECRET, {
//     expiresIn: '1h',
//   })
//   console.log(token, 10)

//   const { key, iv } = generateKeyAndIV()
//   const encryptedToken = encryptToken(token, key, iv)

//   const decryptedToken = decryptToken(encryptedToken, key, iv)
//   console.log(decryptedToken, 10)

//   return token
// }

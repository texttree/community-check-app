import serverApi from '@/helpers/serverApi'
import { supabaseService } from '@/helpers/supabaseService'

export default async function handler(req, res) {
  let userId
  const {
    method,
    body: { tokenName, status },
  } = req
  // так как нам надо чтобы токены были доступны только для пользователя, который авторизован, то просто проверяем авторизацию. А сами запросы будем выполнять через сервисный ключ
  try {
    const _supabase = await serverApi(req, res)
    const {
      data: {
        user: { id },
      },
    } = await _supabase.auth.getUser()
    userId = id
  } catch (error) {
    return res.status(401).json({ error })
  }
  switch (method) {
    case 'GET': // получить токены
      try {
        const { data: tokens, error } = await supabaseService
          .from('tokens')
          .select('name, created_at')
          .eq('user_id', userId)
        if (error) throw error
        return res.status(200).json(tokens)
      } catch (error) {
        return res.status(404).json({ error })
      }

    case 'POST': // если status = 'create', то создать новый токен, если status = 'delete', то удалить токен
      if (status === 'create') {
        try {
          const { data: tokens, error: tokenError } = await supabaseService
            .from('tokens')
            .select()
            .eq('name', tokenName)
            .eq('user_id', userId)
          if (tokenError) {
            throw tokenError
          }
          if (tokens.length > 0) {
            throw new Error('Token already exists')
          }
          const { data, error } = await supabaseService
            .from('tokens')
            .insert({ name: tokenName, user_id: userId })
            .select()
          if (error) {
            throw error
          }
          return res.status(200).json(data[0].id)
        } catch (error) {
          return res.status(404).json({ error })
        }
      } else if (status === 'delete') {
        try {
          await supabaseService
            .from('tokens')
            .delete()
            .match({ name: tokenName, user_id: userId })
          return res.status(200).json({ success: true })
        } catch (error) {
          return res.status(404).json({ error })
        }
      } else {
        return res.status(400).json({ error: 'Invalid status' })
      }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

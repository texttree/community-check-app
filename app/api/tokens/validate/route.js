import { supabaseService } from '@/app/supabase/service'

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Complex create:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
 *         name:
 *           type: string
 *           example: "Check 1"
 *         project_id:
 *           type: number
 *           example: 1
 *         book_id:
 *           type: number
 *           example: 1
 *
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         name:
 *           type: string
 *           example: RLOB
 *
 *     Projects:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Project'
 *
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Book identifier
 *         name:
 *           type: string
 *           description: Book name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time of creation
 *
 *     Check:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Check ID
 *         name:
 *           type: string
 *           description: Check name
 *         material_link:
 *           type: string
 *           nullable: true
 *           description: Check material link
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Check creation datetime
 *         started_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: Check start datetime
 *         finished_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: Check finish datetime
 *
 *     CheckUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: New check name
 *         started_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: New start datetime for the check
 *         finished_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: New finish datetime for the check
 *
 *     Inspector:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Inspector ID
 *         name:
 *           type: string
 *           description: Inspector name
 *
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         note:
 *           type: string
 *         chapter:
 *           type: string
 *         verse:
 *           type: string
 *         check_id:
 *           type: string
 *           format: uuid
 *         inspector_id:
 *           type: string
 *           format: uuid
 *
 *     NoteResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Note ID
 *         note:
 *           type: string
 *           description: Note text
 *         chapter:
 *           type: string
 *           description: Chapter number
 *         verse:
 *           type: string
 *           description: Verse number
 *         inspector_name:
 *           type: string
 *           nullable: true
 *           description: Inspector name
 *
 *     NotesResponse:
 *       type: object
 *       properties:
 *         chapters:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               verses:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       note:
 *                         type: string
 *                         description: Note content
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the note
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the note was created

 * /api/tokens/validate:
 *   get:
 *     summary: Validate user token
 *     description: Checks if the provided token exists and belongs to the user.
 *     tags:
 *       - Token

 *     responses:
 *       200:
 *         description: Token is valid.
 *       401:
 *         description: Unauthorized or invalid token.
 *       500:
 *         description: Internal server error.
 */

export async function GET(req) {
  const userId = req.headers.get('x-user-id')
  const access_token = req.headers.get('x-comcheck-token')
  try {
    if (!userId || !access_token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ message: 'Token is valid' }, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

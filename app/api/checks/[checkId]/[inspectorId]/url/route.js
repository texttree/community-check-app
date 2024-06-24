/**
 * @swagger
 * /api/checks/{checkId}/{inspectorId}/url?chapterNumber=1&lng=en:
 *   get:
 *     summary: Generate link for personal check page
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: checkId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
 *         description: Check ID
 *       - in: path
 *         name: inspectorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
 *         description: Inspector ID
 *       - in: query
 *         name: chapterNumber
 *         required: false
 *         schema:
 *           type: string
 *         description: Chapter number (default is 1)
 *       - in: query
 *         name: lng
 *         required: false
 *         schema:
 *           type: string
 *         description: Language
 *     responses:
 *       200:
 *         description: Generated link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *                   example: https://example.com/en/checks/a1b2c3d4-e5f6-7890-abcd-1234567890ab/1/inspector123
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */

export async function GET(request, { params: { checkId, inspectorId } }) {
  const { searchParams, origin } = new URL(request.url)
  let chapterNumber = searchParams.get('chapterNumber')
  const lng = searchParams.get('lng')

  chapterNumber = chapterNumber || '1'

  if (!checkId || !inspectorId) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let link
  if (lng) {
    link = `${origin}/${lng}/checks/${checkId}/${chapterNumber}/${inspectorId}`
  } else {
    link = `${origin}/checks/${checkId}/${chapterNumber}/${inspectorId}`
  }

  return new Response(JSON.stringify({ link }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

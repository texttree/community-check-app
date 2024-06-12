import { parseChapter, parsingWordText } from '@/helpers/usfmHelper'
import usfm from 'usfm-js'
import { MdToJson } from '@texttree/obs-format-convert-rcl'
import { supabaseService } from '@/app/supabase/service'
import axios from 'axios'
import JSZip from 'jszip'

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create or update material
 *     tags:
 *       - Material
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               materialLink:
 *                 type: string
 *                 description: Link to the material
 *               checkId:
 *                 type: string
 *                 description: ID of the check
 *     responses:
 *       201:
 *         description: The material was created or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

export async function POST(req) {
  const userId = req.headers.get('x-user-id')
  const { materialLink, checkId } = await req.json()

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: x-user-id header is missing' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!materialLink) {
    return new Response(JSON.stringify({ error: 'Material link is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!checkId) {
    return new Response(JSON.stringify({ error: 'Check ID is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { data: isValid, error: validationError } = await supabaseService
      .rpc('is_user_valid_for_check', {
        check_id: checkId,
        user_id: userId,
      })
      .single()

    if (validationError) throw validationError

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'User is not authorized to modify this check' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const content = await fetchContent(materialLink)

    const { data, error } = await supabaseService
      .from('checks')
      .update({ content, material_link: materialLink })
      .eq('id', checkId)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Content updated successfully', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function fetchContent(materialLink) {
  if (materialLink.endsWith('.usfm')) {
    return getDataUsfm(materialLink)
  } else if (materialLink.endsWith('.zip')) {
    return getDataMd(materialLink)
  } else {
    throw new Error('Incorrect material link: unsupported format')
  }
}

async function getDataUsfm(materialLink) {
  try {
    const res = await axios.get(materialLink)
    const jsonData = parsingWordText(usfm.toJSON(res.data))

    if (!jsonData || !jsonData.chapters) {
      throw new Error('Incorrect material format')
    }

    const chapters = jsonData.chapters
    for (const key in chapters) {
      chapters[key] = parseChapter(chapters[key])
    }

    return convertToVerseObjects({ ...jsonData, chapters })
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

async function getDataMd(materialLink) {
  try {
    const response = await axios({
      url: materialLink,
      method: 'GET',
      responseType: 'arraybuffer',
    })

    const zip = await JSZip.loadAsync(response.data)
    const files = []

    zip.forEach((relativePath, file) => {
      const fileName = path.basename(relativePath, '.md')
      if (!file.dir && relativePath.endsWith('.md') && /^[0-4][0-9]|50$/.test(fileName)) {
        files.push(file)
      }
    })

    const jsonDataArray = []

    for (const file of files) {
      const content = await file.async('string')
      if (content.trim().length > 0) {
        jsonDataArray.push(MdToJson(content))
      }
    }

    return jsonDataArray
  } catch (error) {
    console.error('Error processing MD file:', error)
    throw new Error('Error converting Markdown to JSON: ' + error.message)
  }
}

function convertToVerseObjects(data) {
  const verses = []

  for (const [chapter, verseObjects] of Object.entries(data.chapters)) {
    const chapterVerses = verseObjects
      .filter((verse) => verse.verse !== 'front')
      .map((verse) => ({
        text: verse.text,
        verse: verse.verse,
      }))
      .sort((a, b) => compareVerses(a.verse, b.verse))

    verses.push({ chapter, verseObjects: chapterVerses })
  }

  return verses
}

function compareVerses(a, b) {
  return extractVerseNumber(a) - extractVerseNumber(b)
}

function extractVerseNumber(verse) {
  const parts = verse.split('-')
  return parseInt(parts[0], 10)
}

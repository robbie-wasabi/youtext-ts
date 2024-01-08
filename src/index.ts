import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser';
import env from './env'
import { getTranscriptHandler } from './handlers/transcript'
import { getInterpretationHandler } from './handlers/interpretation'
import { SimpleView } from './helpers/views'
import fs from 'fs'
import rateLimit from 'express-rate-limit';

const app = express()
app.use(bodyParser.json())

// Middleware to check API key
// TODO: this is a very basic implementation and should be improved
const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-KEY');
    if (!apiKey || apiKey !== env.apiKey) {
        return res.status(401).send('Unauthorized');
    }
    next();
}

// Create a rate limiter middleware
// TODO: this is a very basic implementation and should be improved
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err)
    res.status(500).send('Internal Server Error')
})

// app.get('/favicon.ico', (req: Request, res: Response) => res.status(204))

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send({
        status: 'Healthy',
        timestamp: new Date().toISOString(),
        version: fs.readFileSync('VERSION', 'utf8').trim()
    })
})

/*
    Doesn't require API key but is rate limited.
    curl -X GET \
        http://localhost:[PORT]/[YT_VIDEO_ID]/interpretation
*/
app.get('/:id/interpretation', limiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) throw new Error('Must supply YouTube video ID')

        const { view, prompt = env.prompt, mock = false, save = false } = req.query
        const decodedPrompt = decodeURIComponent(prompt as string)
        const parsedMock = JSON.parse(mock as string)
        const parsedSave = JSON.parse(save as string)

        const interpretation = await getInterpretationHandler(
            id,
            parsedMock,
            decodedPrompt,
            parsedSave
        )
        view == '1'
            ? res.send(SimpleView(interpretation.content))
            : res.send(interpretation)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

/*
   Requires API key, not rate limited.

    ```bash
        curl -X POST \
        http://localhost:[PORT]/[YT_VIDEO_ID]/interpretation \
        -H 'Content-Type: application/json' \
        -H 'X-API-KEY: your_api_key' \
        -d '{
            "prompt": "your_prompt",
        }'
    ```
*/
app.post('/:id/interpretation', checkApiKey, async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("here")
        const { id } = req.params
        if (!id) throw new Error('Must supply YouTube video ID')

        const { view, prompt = env.prompt, mock = false, save = false } = req.body
        const decodedPrompt = decodeURIComponent(prompt as string)
        const parsedMock = JSON.parse(mock as string)
        const parsedSave = JSON.parse(save as string)

        const interpretation = await getInterpretationHandler(
            id,
            parsedMock,
            decodedPrompt,
            parsedSave
        )
        
        view && view == '1'
            ? res.send(SimpleView(interpretation.content))
            : res.send(interpretation)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

app.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { view, override } = req.query
        const id = req.params.id
        if (!id) {
            throw new Error('Must supply YouTube video ID')
        }

        const transcript = await getTranscriptHandler(id)
        view == '1' ? res.send(SimpleView(transcript)) : res.send(transcript)
    } catch (error) {
        next(error)
    }
})

app.get('/', async (req: Request, res: Response) => {
    res.send(`
        <p>
            Read AI-generated succinct summaries of dialogue-heavy youtube videos like podcasts, documentaries, tutorials, news, etc...
            <br/>
            <br/>

            TUTORIAL:<br/>
            - Might take a few seconds to load.<br/>
            - Just paste the video id in the url like this: https://youtext.io/VIDEO_ID/interpretation<br/>
            - Append "?view=1" to see the transcript in a simple view.<br/>
            - Remove the /interpretation to fetch the transcript only.<br/>
            - Read more about this project here: <a style="cursor:pointer" href="https://github.com/quokkaine/youtext">https://github.com/quokkaine/youtext</a>

            <br/>
            <br/>

            THIS IS A FUN EXPERIMENT. IT HAS BUGS. IT IS FUNDED BY A SINGLE DEVELOPER.<br/>

            <br/>

            email me here: rob@talostec.io
        </p>
    `)
})

app.listen(env.port, () => {
    console.log(`Server is listening on: ${env.port}`)
})

export { app }
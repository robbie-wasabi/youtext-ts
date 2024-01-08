import express, { Request, Response, NextFunction } from 'express'
import env from './env'
import { getTranscriptHandler } from './handlers/transcript'
import { getInterpretationHandler } from './handlers/interpretation'
import { SimpleView } from './helpers/views'
import fs from 'fs'

const app = express()

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err)
    res.status(500).send('Internal Server Error')
})

app.get('/favicon.ico', (req: Request, res: Response) => res.status(204))

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send({
        status: 'Healthy',
        timestamp: new Date().toISOString(),
        version: fs.readFileSync('VERSION', 'utf8').trim()
    })
})

/*
    curl -X GET 'http://localhost:<port>/<video_id>/interpretation?view=1&useMock=false&prompt=your_prompt'

    
*/
app.get('/:id/interpretation', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) throw new Error('Must supply YouTube video ID')

        const { view, prompt = env.prompt, mock = false, save = false } = req.query
        const decodedPrompt = decodeURIComponent(prompt as string)
        const parsedMock = JSON.parse(mock as string)
        const parsedSave = JSON.parse(save as string)

        console.log("here")
        console.log(parsedSave)

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
    console.log(`Server is running at http://localhost:${env.port}`)
})

export { app }
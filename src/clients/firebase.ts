import dotenv from 'dotenv'
dotenv.config()

import { initializeApp, FirebaseApp } from 'firebase/app'
import {
    getFirestore,
    Firestore,
    collection,
    getDocs,
    query,
    where,
    addDoc,
    DocumentData,
    QuerySnapshot
} from 'firebase/firestore'
import env from '../env'
import { Interpretation } from '../types'

export default class FirebaseClient {
    static _app: FirebaseApp = initializeApp(env.firebaseConfig)
    static _db: Firestore = getFirestore(this._app)

    static getInterpretations = async (): Promise<DocumentData[]> => {
        const collectionRef = collection(this._db, 'interpretations')
        const snapshot = await getDocs(collectionRef)
        return snapshot.docs.map((doc) => doc.data())
    }

    static getInterpretation = async (
        ytId: string
    ): Promise<Interpretation | null> => {
        const collectionRef = collection(this._db, 'interpretations')
        const q = query(collectionRef, where('yt_id', '==', ytId))
        const querySnapshot: QuerySnapshot = await getDocs(q)
        if (querySnapshot.empty) {
            return null
        }
        const data: DocumentData = querySnapshot.docs[0].data()
        if (Array.isArray(data.content)) data.content = data.content.join(' ')
        return {
            id: data.yt_id,
            content: data.content
        }
    }

    static addInterpretation = async (
        yt_id: string,
        content: string[]
    ): Promise<any> => {
       return await addDoc(collection(this._db, 'interpretations'), {
            yt_id,
            content
        })
    }
}

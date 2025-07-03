import express, { Request, Response} from "express";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MongoConnectionURI || "mongodb://localhost:27017");
const database = client.db(process.env.MongoDatabaseName)
const collection = database.collection<Url>(process.env.MongoCollection || "url");

interface Url {
    url: string;
    shortUrl: string;
    createdAt: Date;
    expiresAt: Date;
}

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

function generateNewUrl(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * characters.length);
        result += characters[index];
    }

    return result;
}

async function generateShortenURL(url: any): Promise<string> {
    let shortUrl: string;
    let urlExists: Url | null;

    do {
        shortUrl = generateNewUrl();
        urlExists = await collection.findOne({ shortUrl });
    } while (urlExists);

    const newUrl: Url = {
        url,
        shortUrl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await collection.insertOne(newUrl);
    return shortUrl;
}

async function removeUrlDatabase(url: any): Promise<any> {
    const result = await collection.deleteOne(url);
    return result;
}
async function verifyUrlInDatabase(shortUrl: string): Promise<Url | null> {
    const result = await collection.findOne({ shortUrl });
    return result || null;
}

app.post('/shortenUrl', (async (req: Request, res: Response) => {
    const urlParam = req.query.url;

    if (typeof urlParam !== 'string') {
        return res.status(400).send('"url" parameter is required.');
    }

    try {
        const newUrl = await generateShortenURL(urlParam);
        res.status(201).send(newUrl);
    } catch (err) {
        console.error('Error generating shortened URL:', err);
        res.status(500).send('Internal server error');
    }
}) as any);

app.get('/:shortUrl', (async (req: Request, res: Response) => {
    const shortUrl = req.params.shortUrl;

    const result = await verifyUrlInDatabase(shortUrl);

    if (!result) {
        return res.status(404).send('URL not found.');
    }

    if (result.expiresAt < new Date()) {
        await removeUrlDatabase(result.url);
        return res.status(410).send('This URL has expired.');
    }

    return res.redirect(result.url);
}) as any);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    connectDB();
    console.log(`Server running...`);
});

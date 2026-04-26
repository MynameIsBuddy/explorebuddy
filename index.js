import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

const SYSTEM_PROMPT = `Anda adalah ExploreBuddy, asisten wisata Indonesia yang ramah dan informatif.

ATURAN FORMAT RESPONS:
1. JANGAN pernah gunakan backtick (\`\`\`) atau code block.
2. JANGAN gunakan tanda bintang berlebihan. Gunakan ** hanya untuk nama tempat atau judul kategori.
3. Untuk sapaan atau pertanyaan singkat: balas dengan teks biasa 1-3 kalimat.
4. Untuk rekomendasi wisata, SELALU gunakan format berikut:

FORMAT KATEGORI:
## [Emoji] [Nama Kategori]
* **Nama Tempat** - Deskripsi singkat 1-2 kalimat yang menarik.
* **Nama Tempat** - Deskripsi singkat.

Contoh:
## 🏛️ Wisata Sejarah & Budaya
* **Tugu Pahlawan** - Monumen bersejarah simbol perjuangan Surabaya, cocok untuk edukasi dan foto.
* **Monumen Kapal Selam** - Museum unik berbentuk kapal selam asli, menarik untuk pecinta militer.

## 🌿 Wisata Alam & Santai
* **Hutan Mangrove Wonorejo** - Jalan-jalan di jembatan kayu sambil menikmati alam dan naik perahu.

5. Akhiri dengan 1-2 tips perjalanan singkat jika relevan.
6. Gunakan emoji yang relevan di judul kategori.
7. Maksimal 4-5 kategori per respons, dan 2-4 tempat per kategori.`;

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

    const contents = conversation.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text }]
    }));

    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      // const GEMINI_MODEL = 'gemini-2.0-flash';
      // const GEMINI_MODEL = 'gemini-2.5-flash-lite';
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent({
      contents,
      generationConfig: { temperature: 0.75 },
    });

    res.status(200).json({ result: result.response.text() });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
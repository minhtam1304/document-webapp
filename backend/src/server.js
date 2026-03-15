const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const { initDb, run, all, get } = require('./db');
const { TAXONOMY, CONTENT_TYPES, isValidTaxonomy } = require('./taxonomy');

const app = express();
const port = process.env.PORT || 4000;
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    callback(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/taxonomy', (_req, res) => {
  res.json({ taxonomy: TAXONOMY, contentTypes: CONTENT_TYPES });
});

app.get('/api/documents', async (req, res) => {
  try {
    const { subject, topic, contentType, q } = req.query;
    const clauses = [];
    const params = [];

    if (subject) {
      clauses.push('subject = ?');
      params.push(subject);
    }

    if (topic) {
      clauses.push('topic = ?');
      params.push(topic);
    }

    if (contentType) {
      clauses.push('content_type = ?');
      params.push(contentType);
    }

    if (q) {
      clauses.push('title LIKE ?');
      params.push(`%${q}%`);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = await all(
      `
      SELECT
        id,
        title,
        subject,
        topic,
        content_type AS contentType,
        original_name AS originalName,
        stored_name AS storedName,
        mime_type AS mimeType,
        size,
        file_path AS filePath,
        external_url AS externalUrl,
        created_at AS createdAt
      FROM documents
      ${where}
      ORDER BY created_at DESC
      `,
      params,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Khong lay duoc danh sach tai lieu.', error: error.message });
  }
});

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, topic, contentType, externalUrl } = req.body;

    if (!title || !subject || !topic || !contentType) {
      res.status(400).json({ message: 'Thieu thong tin bat buoc.' });
      return;
    }

    if (!isValidTaxonomy(subject, topic, contentType)) {
      res.status(400).json({ message: 'Danh muc khong hop le.' });
      return;
    }

    if (!req.file && !externalUrl) {
      res.status(400).json({ message: 'Can upload file hoac nhap duong dan tai lieu.' });
      return;
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await run(
      `
      INSERT INTO documents (
        title,
        subject,
        topic,
        content_type,
        original_name,
        stored_name,
        mime_type,
        size,
        file_path,
        external_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        subject,
        topic,
        contentType,
        req.file?.originalname || null,
        req.file?.filename || null,
        req.file?.mimetype || null,
        req.file?.size || null,
        filePath,
        externalUrl || null,
      ],
    );

    const inserted = await get(
      `
      SELECT
        id,
        title,
        subject,
        topic,
        content_type AS contentType,
        original_name AS originalName,
        stored_name AS storedName,
        mime_type AS mimeType,
        size,
        file_path AS filePath,
        external_url AS externalUrl,
        created_at AS createdAt
      FROM documents
      WHERE id = ?
      `,
      [result.id],
    );

    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ message: 'Upload that bai.', error: error.message });
  }
});

app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const row = await get(
      `
      SELECT id, title, original_name AS originalName, file_path AS filePath, external_url AS externalUrl
      FROM documents
      WHERE id = ?
      `,
      [req.params.id],
    );

    if (!row) {
      res.status(404).json({ message: 'Khong tim thay tai lieu.' });
      return;
    }

    if (row.externalUrl) {
      res.redirect(row.externalUrl);
      return;
    }

    if (!row.filePath) {
      res.status(404).json({ message: 'Tai lieu khong co file de tai.' });
      return;
    }

    const absolutePath = path.join(__dirname, '..', row.filePath.replace('/uploads/', 'uploads/'));

    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ message: 'File khong ton tai tren server.' });
      return;
    }

    res.download(absolutePath, row.originalName || `${row.title}.pdf`);
  } catch (error) {
    res.status(500).json({ message: 'Khong the tai tai lieu.', error: error.message });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Khoi tao DB that bai:', error);
    process.exit(1);
  });

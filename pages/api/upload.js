import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public/images/blog');
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }

      const file = files.image;
      const newPath = path.join(form.uploadDir, file.originalFilename);
      
      fs.renameSync(file.filepath, newPath);
      
      const imageUrl = `/images/blog/${file.originalFilename}`;
      res.status(200).json({ imageUrl });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

// Package dependencies
{
  "dependencies": {
    "formidable": "^3.5.0"
  }
}
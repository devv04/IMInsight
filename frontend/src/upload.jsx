import { useState, useEffect, useRef } from 'react';
import GeoTIFFPreview from './GeoTIFFPreview';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Upload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isGeoTIFF, setIsGeoTIFF] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(1);
  const missionLogRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalysisResult(null);
    setZoom(1);

    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (['tiff', 'geotiff'].includes(fileType)) {
      setIsGeoTIFF(true);
      setPreviewUrl(null);
    } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
      setIsGeoTIFF(false);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setIsGeoTIFF(false);
      setPreviewUrl(null);
      alert('Unsupported file format. Accepted formats: JPG, PNG, GeoTIFF');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 500);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setAnalysisResult({ error: 'Analysis Failed: Unable to process the file' });
    } finally {
      clearInterval(interval);
      setProgress(100);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleClose = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="upload-container">
      <div className="mission-brief">
        <h2>File Upload</h2>
        <label htmlFor="file-upload">Select File:</label>
        <input
          id="file-upload"
          type="file"
          accept=".jpg,.jpeg,.png,.tiff,.geotiff"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={!file || isLoading}>
          Analyze File
        </button>
        {isLoading && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="preview-section">
        {isGeoTIFF && file && <GeoTIFFPreview file={file} />}

        {previewUrl && (
          <div className="image-preview">
            <h3>Image Preview</h3>
            <div className="zoom-controls">
              <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>Zoom Out</button>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>Zoom In</button>
            </div>
            <div style={{ overflow: 'auto', display: 'flex', justifyContent: 'center', border: '1px solid #FFD700', borderRadius: '8px', padding: '10px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease-in-out',
                  objectFit: 'contain',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="mission-log" ref={missionLogRef}>
            <h3>Mission Log: Intelligence Report</h3>
            {analysisResult.error ? (
              <p style={{ color: 'red' }}>{analysisResult.error}</p>
            ) : (
              <>
                <p><strong>File:</strong> {analysisResult.file_info.filename}</p>
                <p><strong>Size:</strong> {analysisResult.file_info.size[0]}x{analysisResult.file_info.size[1]}</p>
                <p><strong>Format:</strong> {analysisResult.file_info.format}</p>

                <div style={{ marginTop: '15px' }}>
                  <p><strong>Caption:</strong> {analysisResult.caption?.text || 'No caption available'}</p>
                  <p><strong>Object Count:</strong> {analysisResult.caption?.object_count || 'N/A'}</p>
                  <p><strong>Confidence:</strong> {analysisResult.caption?.confidence || 'N/A'}</p>
                  <p><strong>Classification:</strong> {analysisResult.classification?.label || 'N/A'} ({(analysisResult.classification?.confidence * 100 || 0).toFixed(1)}%)</p>
                </div>

                {analysisResult.detections?.summary && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: '#1e1e2f',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}>
                    <strong>Object Detection Summary:</strong>
                    <ul style={{ marginTop: '10px' }}>
                      {Object.entries(analysisResult.detections.summary).map(([label, count], idx) => (
                        <li key={idx}>
                          • <strong>{label.charAt(0).toUpperCase() + label.slice(1)}</strong>: {count}
                        </li>
                      ))}
                    </ul>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Total Detected Objects:</strong> {Object.values(analysisResult.detections.summary).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                )}

                {analysisResult.anomalies_detected && (
                  <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    background: '#3c2c3e',
                    borderRadius: '10px'
                  }}>
                    <strong>Anomaly Detection:</strong>
                    <ul>
                      {analysisResult.anomalies_detected.anomalies_detected.map((anomaly, idx) => (
                        <li key={idx}>• {anomaly}</li>
                      ))}
                    </ul>
                    <p>Total Anomalies: {analysisResult.anomalies_detected.count}</p>
                  </div>
                )}

                {analysisResult.naval_assessment && (
                  <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    background: '#2c3e50',
                    borderRadius: '10px'
                  }}>
                    <strong>Naval Assessment:</strong>
                    <p>Status: {analysisResult.naval_assessment.status}</p>
                    <p>Priority: {analysisResult.naval_assessment.priority}</p>
                    <p>Recommendation: {analysisResult.naval_assessment.recommendation}</p>
                  </div>
                )}
              </>
            )}
            <button onClick={handleClose} style={{ marginTop: '10px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
import React, { useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const CertificateButton = ({ userId, courseId }) => {
  const {backendUrl} = useContext(AppContext)
  const handleDownload = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/certificates/generate`,
        { userId, courseId },
        { responseType: 'blob' } // 🔥 important for file downloads
      );

      // Create a temporary URL for the blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Trigger file download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Certificate.pdf'; // Optionally customize filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Clean up
    } catch (err) {
      console.error('❌ Certificate generation error:', err);
      alert('Certificate generation failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: '10px 20px',
        backgroundColor: '#1d4ed8',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
      onMouseOut={(e) => (e.target.style.backgroundColor = '#1d4ed8')}
    >
      🎓 Download Certificate
    </button>
  );
};

export default CertificateButton;

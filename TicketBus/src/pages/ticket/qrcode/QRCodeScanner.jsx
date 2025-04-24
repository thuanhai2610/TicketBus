import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import '../qrcode/style.css'
const QRCodeScanner = () => {
  const [data, setData] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (result) => {
    if (result) {
      try {
        setIsScanning(false);
        let ticketData;
        if (typeof result === 'string') {
          if (result.includes('ticket In')) {
            const parsedData = {};
            const pairs = result.match(/(\w+)\s*:\s*([^,}]+)/g);
            if (pairs) {
              pairs.forEach(pair => {
                const [key, value] = pair.split(':').map(item => item.trim());
                parsedData[key] = value;
              });
            }
            ticketData = parsedData;
          } else {
            ticketData = JSON.parse(result);
          }
        } else {
          ticketData = result;
        }
        
        setData(ticketData);
        setScanError('');
        console.log('Processed ticket data:', ticketData);
      } catch (error) {
        setScanError('QR code scanned but format is invalid. Expected JSON ticket data.');
        console.error('Error parsing QR code data:', error);
      }
    }
  };

  const handleError = (err) => {
    setScanError(`Error scanning QR code: ${err.message}`);
    console.error('QR Scanner error:', err);
  };

  const resetScanner = () => {
    setData(null);
    setScanError('');
    setIsScanning(true);
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="scanner-container">
      <h2 className="scanner-title">Quét mã QR vé xe</h2>
      
      {isScanning ? (
        <div className="qr-reader-wrapper">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                handleError(error);
              }
            }}
            className="qr-reader"
            style={{ width: '100%', maxWidth: '500px' }}
          />
          {scanError && <p className="scan-error">{scanError}</p>}
        </div>
      ) : (
        <button 
          className="scan-again-button"
          onClick={resetScanner}
        >
          Quét mã QR khác
        </button>
      )}

      {data && (
        <div className="ticket-container">
          <div className="ticket-header">
            <h2>Vé xe bus</h2>
            <span className="ticket-status" data-status={data.status || 'Unknown'}>
              {data.status || 'Unknown'}
            </span>
          </div>
          
          <div className="ticket-content">
            <div className="ticket-info-row">
              <span className="info-label">Mã vé:</span>
              <span className="info-value">{data.ticketId}</span>
            </div>
            
            <div className="ticket-info-row">
              <span className="info-label">Tên hành khách:</span>
              <span className="info-value">{data.fullName}</span>
            </div>
            
            <div className="ticket-journey">
              <div className="journey-point">
                <div className="point-marker departure"></div>
                <div className="point-details">
                  <div className="point-name">{data.departurePoint}</div>
                  <div className="point-time">{formatDateTime(data.departureTime)}</div>
                </div>
              </div>
              
              <div className="journey-line"></div>
              
              <div className="journey-point">
                <div className="point-marker arrival"></div>
                <div className="point-details">
                  <div className="point-name">{data.destinationPoint}</div>
                </div>
              </div>
            </div>
            
            <div className="ticket-details">
              <div className="ticket-info-row">
                <span className="info-label">Chỗ ngồi:</span>
                <div className="seat-container">
                  {data.seats && Array.isArray(data.seats) ? 
                    data.seats.map((seat, index) => (
                      <span key={index} className="seat-badge">{seat}</span>
                    )) : 
                    <span className="seat-badge">{data.seats}</span>
                  }
                </div>
              </div>
              
              <div className="ticket-info-row">
                <span className="info-label">Biển số xe:</span>
                <span className="info-value license-plate">{data.lisencePlate}</span>
              </div>
            </div>
          </div>
          
          <div className="ticket-footer">
            <div className="barcode"></div>
            <p className="ticket-note">Vui lòng xuất trình vé này khi lên xe</p>
          </div>
        </div>
      )}
      
      {!data && !isScanning && (
        <div className="no-data-message">
          <p>Không tìm thấy dữ liệu vé. Vui lòng thử quét lại.</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
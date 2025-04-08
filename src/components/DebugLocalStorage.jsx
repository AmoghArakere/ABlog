import React, { useState, useEffect } from 'react';

export default function DebugLocalStorage() {
  const [storageData, setStorageData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyDetails, setKeyDetails] = useState(null);

  useEffect(() => {
    // Get all localStorage keys and values
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        // Try to parse as JSON
        const value = localStorage.getItem(key);
        data[key] = value;
      } catch (e) {
        data[key] = localStorage.getItem(key);
      }
    }
    setStorageData(data);
  }, []);

  const handleKeyClick = (key) => {
    setSelectedKey(key);
    try {
      const value = localStorage.getItem(key);
      // Try to parse as JSON
      try {
        const parsedValue = JSON.parse(value);
        setKeyDetails({ 
          raw: value,
          parsed: parsedValue,
          isJSON: true 
        });
      } catch (e) {
        // Not valid JSON
        setKeyDetails({ 
          raw: value,
          isJSON: false,
          isImage: value && (value.startsWith('data:image') || value.includes('/images/'))
        });
      }
    } catch (e) {
      setKeyDetails({ error: e.message });
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">LocalStorage Debug</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Storage Keys</h3>
          <div className="bg-gray-800 p-3 rounded-lg max-h-96 overflow-y-auto">
            {Object.keys(storageData).length === 0 ? (
              <p className="text-gray-400">No data in localStorage</p>
            ) : (
              <ul className="space-y-1">
                {Object.keys(storageData).map(key => (
                  <li 
                    key={key} 
                    className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${selectedKey === key ? 'bg-blue-900' : ''}`}
                    onClick={() => handleKeyClick(key)}
                  >
                    {key} <span className="text-gray-400 text-xs">({typeof storageData[key] === 'string' ? `${storageData[key].length} chars` : 'unknown'})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Details</h3>
          <div className="bg-gray-800 p-3 rounded-lg max-h-96 overflow-y-auto">
            {!selectedKey ? (
              <p className="text-gray-400">Select a key to view details</p>
            ) : keyDetails?.error ? (
              <p className="text-red-400">Error: {keyDetails.error}</p>
            ) : keyDetails?.isImage ? (
              <div>
                <p className="mb-2">Image data:</p>
                <img 
                  src={keyDetails.raw} 
                  alt="Stored image" 
                  className="max-w-full h-auto max-h-64 border border-gray-700 rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-profile.svg';
                    e.target.style.opacity = 0.5;
                  }}
                />
                <p className="mt-2 text-xs text-gray-400">
                  {keyDetails.raw.substring(0, 50)}...
                  {keyDetails.raw.length > 50 ? ` (${keyDetails.raw.length} chars total)` : ''}
                </p>
              </div>
            ) : keyDetails?.isJSON ? (
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(keyDetails.parsed, null, 2)}
              </pre>
            ) : (
              <div>
                <p className="mb-2">Raw value:</p>
                <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-2 rounded">
                  {keyDetails?.raw}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

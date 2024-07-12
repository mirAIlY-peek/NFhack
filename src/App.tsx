import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Candidate {
  _id?: string;
  category: string;
  telegram: string;
  experience: string;
  projects: string;
  achievements: string;
  prediction?: string;
  confidence?: number;
}

function App() {
  const [candidates, setCandidates] = useState<{
    approved: Candidate[];
    whitelist: Candidate[];
    rejected: Candidate[];
  }>({ approved: [], whitelist: [], rejected: [] });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [decision, setDecision] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get<{
        approved: Candidate[];
        whitelist: Candidate[];
        rejected: Candidate[];
      }>('http://localhost:3005/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      alert('Failed to fetch candidates. Please check the console for more details.');
    }
  };

  const handleLoadAndProcess = async () => {
    try {
      const response = await axios.get<any[]>('http://localhost:3005/helloworld');
      await axios.post('http://localhost:3005/process-data', { data: response.data });
      fetchCandidates();
      resetSelection();
    } catch (error) {
      console.error('Error loading and processing data:', error);
      alert('Failed to load and process data. Please check the console for more details.');
    }
  };

  const handleDecision = async () => {
    if (selectedCandidate && decision && reason) {
      try {
        await axios.post('http://localhost:3005/decide', {
          id: selectedCandidate._id,
          decision,
          reason,
        });
        fetchCandidates();
        resetSelection();
      } catch (error) {
        console.error('Error making decision:', error);
        alert('Failed to make decision. Please check the console for more details.');
      }
    }
  };

  const resetModel = async () => {
    try {
      await axios.post('http://localhost:3005/reset-model');
      alert('Model reset successfully');
      fetchCandidates();
      resetSelection();
    } catch (error) {
      console.error('Error resetting model:', error);
      alert('Failed to reset model. Please check the console for more details.');
    }
  };

  const resetSelection = () => {
    setSelectedCandidate(null);
    setDecision('');
    setReason('');
  };

  return (
      <div className="bg-black text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">ML Classifier Dashboard</h1>

        <div className="mb-8 flex space-x-4">
          <button onClick={handleLoadAndProcess} className="bg-white text-black px-4 py-2 rounded">
            Load and Process Data
          </button>
          <button onClick={resetModel} className="bg-white text-black px-4 py-2 rounded">
            Reset Model
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {['Approved', 'Whitelist', 'Rejected'].map((listType) => (
              <div key={listType}>
                <h2 className="text-xl font-semibold mb-4">{listType} Candidates</h2>
                <ul className="bg-gray-900 rounded p-4">
                  {candidates[listType.toLowerCase() as keyof typeof candidates].map((candidate) => (
                      <li
                          key={candidate._id}
                          className="cursor-pointer hover:bg-gray-800 p-2 rounded mb-2"
                          onClick={() => setSelectedCandidate(candidate)}
                      >
                        {candidate.category} - {candidate.telegram}
                      </li>
                  ))}
                </ul>
              </div>
          ))}
        </div>

        {selectedCandidate && (
            <div className="mt-8 bg-gray-900 rounded p-6">
              <h2 className="text-xl font-semibold mb-4">Make Decision</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Category:</strong> {selectedCandidate.category}</p>
                  <p><strong>Experience:</strong> {selectedCandidate.experience}</p>
                  <p><strong>Projects:</strong> {selectedCandidate.projects}</p>
                  <p><strong>Achievements:</strong> {selectedCandidate.achievements}</p>
                </div>
                <div>
                  <p><strong>Prediction:</strong> {selectedCandidate.prediction}</p>
                  <p><strong>Confidence:</strong> {selectedCandidate.confidence}</p>
                  <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-4 w-full bg-gray-800 p-2 rounded"
                  >
                    <option value="">Select decision</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                  <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for decision"
                      className="mt-4 w-full bg-gray-800 p-2 rounded"
                      rows={4}
                  />
                  <button
                      onClick={handleDecision}
                      className="mt-4 bg-white text-black px-4 py-2 rounded w-full"
                  >
                    Submit Decision
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;

import React, { useState, useCallback, ChangeEvent } from 'react';
import { generateEmailVariations } from '../utils/emailVariations';
import copyToClipboard from '../utils/copyToClipboard';
import { GeneratedEmail } from '../types';

const EmailGenerator: React.FC = () => {
  const [baseEmail, setBaseEmail] = useState<string>('');
  const [numVariations, setNumVariations] = useState<number>(10);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [error, setError] = useState<string>('');

  const handleBaseEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBaseEmail(e.target.value);
    setError(''); // Clear error on input change
  }, []);

  const handleNumVariationsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 100) { // Limit to 100 for performance/UI
      setNumVariations(value);
    } else if (value > 100) {
      setNumVariations(100);
    } else {
      setNumVariations(1); // Default to 1 if invalid
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    // Basic regex for email validation, focusing on Gmail-like structure
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleGenerate = useCallback(() => {
    if (!validateEmail(baseEmail)) {
      setError('Please enter a valid Gmail address (e.g., user.name@gmail.com).');
      setGeneratedEmails([]);
      return;
    }
    setError('');
    const variations = generateEmailVariations(baseEmail, numVariations);
    setGeneratedEmails(variations);
  }, [baseEmail, numVariations]);

  const handleCopy = useCallback(async (id: string, emailText: string) => {
    const success = await copyToClipboard(emailText);
    if (success) {
      setGeneratedEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === id && email.copyCount < 2
            ? { ...email, copyCount: email.copyCount + 1 }
            : email
        )
      );
    } else {
      alert('Failed to copy email. Please try again or copy manually.');
    }
  }, []); // copyToClipboard is a stable utility function, no dependencies needed besides it being in scope

  const handleDownloadAll = useCallback(() => {
    if (generatedEmails.length === 0) {
      alert('No emails to download.');
      return;
    }
    const allEmails = generatedEmails.map(e => e.email).join('\n');
    const blob = new Blob([allEmails], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gmail_variations.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedEmails]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center">
        Gmail Variation Generator
      </h2>

      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="baseEmail" className="block text-gray-700 text-sm font-bold mb-2">
            Base Gmail Address:
          </label>
          <input
            id="baseEmail"
            type="email"
            value={baseEmail}
            onChange={handleBaseEmailChange}
            placeholder="e.g., john.doe@gmail.com"
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Base Gmail Address"
          />
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        </div>

        <div>
          <label htmlFor="numVariations" className="block text-gray-700 text-sm font-bold mb-2">
            Number of Variations (1-100):
          </label>
          <input
            id="numVariations"
            type="number"
            value={numVariations}
            onChange={handleNumVariationsChange}
            min="1"
            max="100"
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Number of Variations"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        >
          Generate Variations
        </button>
      </div>

      {generatedEmails.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Emails:</h3>
          <ul className="space-y-3">
            {generatedEmails.map(email => (
              <li key={email.id} className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-gray-900 break-all text-sm sm:text-base mb-2 sm:mb-0 sm:mr-4">
                  {email.email}
                </span>
                <button
                  onClick={() => handleCopy(email.id, email.email)}
                  disabled={email.copyCount >= 2}
                  className={`flex-shrink-0 text-xs sm:text-sm font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out
                    ${email.copyCount >= 2
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2'
                    }`}
                  aria-label={`Copy ${email.email}`}
                >
                  {email.copyCount === 0 && 'Copy'}
                  {email.copyCount === 1 && 'Copy (1 left)'}
                  {email.copyCount >= 2 && 'Copied Twice'}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <button
              onClick={handleDownloadAll}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 text-sm sm:text-base"
              aria-label="Download All Generated Emails"
            >
              Download All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailGenerator;
import { useState } from 'react';

export default function useContentGeneration(fetchData, addNotification) {
  const [generating, setGenerating] = useState({});

  const handleGenerateQA = async (itemId) => {
    try {
      setGenerating(prev => ({ ...prev, [`qa-${itemId}`]: true }));
      
      console.log(`Calling API: generate-qa-single/${itemId}`);
      
      const response = await fetch(`http://localhost:8000/generate-qa-single/${itemId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      addNotification('success', `Generated Q&A for item #${itemId}`);
      
      await fetchData();
    } catch (error) {
      console.error('Error generating QA:', error);
      addNotification('error', `Failed to generate Q&A: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [`qa-${itemId}`]: false }));
    }
  };
  
  const handleGenerateKnowledge = async (itemId) => {
    try {
      setGenerating(prev => ({ ...prev, [`kp-${itemId}`]: true }));
      
      console.log(`Calling API: generate-knowledge-single/${itemId}`);
      
      const response = await fetch(`http://localhost:8000/generate-knowledge-single/${itemId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      addNotification('success', `Generated knowledge point for item #${itemId}`);
      
      await fetchData();
    } catch (error) {
      console.error('Error generating knowledge point:', error);
      addNotification('error', `Failed to generate knowledge point: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [`kp-${itemId}`]: false }));
    }
  };

  return { generating, handleGenerateQA, handleGenerateKnowledge };
}
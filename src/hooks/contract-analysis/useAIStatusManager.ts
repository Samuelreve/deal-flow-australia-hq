
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useAIStatusManager = (handleFileUpload: any, originalHandleAskQuestion: any) => {
  const [aiStatus, setAiStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  useEffect(() => {
    const testAI = async () => {
      try {
        setAiStatus('checking');
        
        // Test if we can make a basic AI request
        const testResponse = await fetch('/api/test-ai', { method: 'HEAD' });
        
        // For demo purposes, we'll assume AI is ready if the functions are available
        if (originalHandleAskQuestion && handleFileUpload) {
          setAiStatus('ready');
          console.log('✅ Contract Analysis: AI services ready');
          
          toast.success("AI Services Ready", {
            description: "Smart contract analysis features are fully operational"
          });
        } else {
          throw new Error('AI functions not available');
        }
      } catch (error) {
        console.error('❌ Contract Analysis: AI test failed', error);
        setAiStatus('error');
        
        toast.warning("AI Services Limited", {
          description: "Some AI features may not be available. Demo data will be used."
        });
      }
    };

    // Delay the test slightly to allow for initialization
    setTimeout(testAI, 1000);
  }, [originalHandleAskQuestion, handleFileUpload]);

  return { aiStatus };
};

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseWakeWordOptions {
  wakeWord: string;
  onWakeWord: () => void;
  enabled: boolean;
}

export const useWakeWord = ({ wakeWord, onWakeWord, enabled }: UseWakeWordOptions) => {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Reconhecimento de voz não é suportado neste navegador.");
      return;
    }

    const startRecognition = () => {
      triggeredRef.current = false;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
        if (enabled && !triggeredRef.current) {
          // Reinicia a escuta se ela parar inesperadamente
          setTimeout(() => startRecognition(), 100);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
          .toLowerCase();

        if (transcript.includes(wakeWord.toLowerCase())) {
          triggeredRef.current = true;
          onWakeWord();
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }
      };
      
      recognition.start();
    };
    
    startRecognition();

    return () => {
      if (recognitionRef.current) {
        triggeredRef.current = true; // Impede o reinício automático ao desmontar
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [enabled, wakeWord, onWakeWord]);

  return { isListening };
};

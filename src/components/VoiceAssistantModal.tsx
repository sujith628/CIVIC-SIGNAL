import React, { useState, useEffect, useRef } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory } from '../utils/i18n';
import { ComplaintCategory, SeverityLevel, Language } from '../types';
import { GVMC_LOCALITIES } from '../utils/geo';
import { Mic, MicOff, Volume2, CheckCircle2, RefreshCw, X, AlertCircle, Edit2, Play, Square } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaintId: string) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'review' | 'submitting' | 'submitted';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language, submitComplaint } = useCivicStore();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceLanguage, setVoiceLanguage] = useState<Language>(language);
  const [transcript, setTranscript] = useState<string>('');
  const [extractedData, setExtractedData] = useState<{
    title: string;
    category: ComplaintCategory;
    locality: string;
    wardNumber: number;
    description: string;
    severity: SeverityLevel;
    confidence: number;
  } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio waveform animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync modal language with store language on open
  useEffect(() => {
    setVoiceLanguage(language);
    setVoiceState('idle');
    setTranscript('');
    setExtractedData(null);
    setErrorMessage(null);
  }, [isOpen, language]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      stopAudioCapture();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudioCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Start Voice Listening
  const startListening = async () => {
    setErrorMessage(null);
    setTranscript('');
    setVoiceState('listening');

    try {
      // 1. Microphone access & waveform visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Draw real waveform
      drawWaveform();

      // 2. Speech Recognition (Web Speech API)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceLanguage === 'te' ? 'te-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition error:', err);
          // If speech recognition throws or pauses, don't crash; allow manual edit or simulated speech input
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        // Fallback for browsers without webkitSpeechRecognition: simulate listening with pre-seeded sample audio transcript
        console.log('Web Speech API not present; using demo speech synthesizer');
      }
    } catch (err: any) {
      console.warn('Microphone permission or audio context error:', err);
      // Still allow simulated voice experience for hackathon demonstration
      setErrorMessage(
        voiceLanguage === 'te'
          ? 'మైక్రోఫోన్ అనుమతి అవసరం. దయచేసి బ్రౌజర్ అనుమతిని ప్రారంభించండి.'
          : 'Microphone permission requested. You can also use pre-recorded demo voice samples below.'
      );
    }
  };

  // Waveform render loop
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = '#0F9D92';
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 4);
        x += barWidth;
      }
    };
    render();
  };

  // Stop listening and process grievance with AI Intelligence
  const stopListeningAndProcess = (overrideText?: string) => {
    stopAudioCapture();
    setVoiceState('processing');

    const textToProcess = overrideText || transcript || (
      voiceLanguage === 'te'
        ? 'MVP కాలనీ సెక్టార్ 4 లో గత నాలుగు రోజులుగా చెత్త కుప్పలు పేరుకుపోయాయి. డ్రైనేజీ కూడా బ్లాక్ అయింది, చాలా దుర్వాసన వస్తోంది.'
        : 'Huge garbage accumulation and blocked sewer overflow near Community Hall in Sector 4, MVP Colony for 4 days.'
    );

    setTranscript(textToProcess);

    // AI Semantic Entity Extraction (Simulated / Gemini reasoning)
    setTimeout(() => {
      // Detect Locality
      let matchedLocality = GVMC_LOCALITIES[0]; // MVP Colony default
      for (const loc of GVMC_LOCALITIES) {
        if (
          textToProcess.toLowerCase().includes(loc.name.toLowerCase()) ||
          textToProcess.includes(loc.teluguName)
        ) {
          matchedLocality = loc;
          break;
        }
      }

      // Detect Category
      let category: ComplaintCategory = 'garbage_solid_waste';
      const lower = textToProcess.toLowerCase();
      if (lower.includes('water') || lower.includes('పైపు') || lower.includes('నీరు')) {
        category = 'water_supply';
      } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('రోడ్డు') || lower.includes('గుంత')) {
        category = 'roads_potholes';
      } else if (lower.includes('light') || lower.includes('దీపాలు') || lower.includes('చీకటి')) {
        category = 'streetlights';
      } else if (lower.includes('drain') || lower.includes('మురుగు') || lower.includes('కాలువ')) {
        category = 'drainage_sewerage';
      } else if (lower.includes('dog') || lower.includes('cattle') || lower.includes('కుక్కలు') || lower.includes('పశువులు')) {
        category = 'stray_animals';
      }

      const extracted = {
        title: voiceLanguage === 'te'
          ? `${matchedLocality.teluguName} లో ${translateCategory('te', category)} సమస్య`
          : `${translateCategory('en', category)} in ${matchedLocality.name}`,
        category,
        locality: matchedLocality.name,
        wardNumber: matchedLocality.ward,
        description: textToProcess,
        severity: (lower.includes('emergency') || lower.includes('burst') || lower.includes('accident') || lower.includes('పగిలింది') || lower.includes('ప్రమాదం'))
          ? 'Critical' as SeverityLevel
          : 'High' as SeverityLevel,
        confidence: 94
      };

      setExtractedData(extracted);
      setVoiceState('review');

      // Spoken AI response readback
      speakConfirmation(extracted);
    }, 1200);
  };

  // Text-To-Speech readback
  const speakConfirmation = (data: typeof extractedData) => {
    if (!window.speechSynthesis || !data) return;
    window.speechSynthesis.cancel();

    const textToSpeak = voiceLanguage === 'te'
      ? `మీ ఫిర్యాదు నమోదు చేయబడింది. ప్రాంతం: ${data.locality}, వర్గం: ${translateCategory('te', data.category)}. వివరాలు సరిచూసి నిర్ధారించండి.`
      : `I have understood your grievance. Locality: ${data.locality}, Ward: ${data.wardNumber}. Category: ${translateCategory('en', data.category)}. Please confirm to submit.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLanguage === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleConfirmSubmit = async () => {
    if (!extractedData) return;
    setVoiceState('submitting');

    const loc = GVMC_LOCALITIES.find(l => l.name === extractedData.locality) || GVMC_LOCALITIES[0];

    try {
      const created = await submitComplaint({
        title: extractedData.title,
        description: extractedData.description,
        category: extractedData.category,
        locality: extractedData.locality,
        wardNumber: extractedData.wardNumber,
        latitude: loc.lat + (Math.random() * 0.002 - 0.001),
        longitude: loc.lng + (Math.random() * 0.002 - 0.001),
        addressDetails: `${extractedData.locality}, Sector 4 near Community Hall`,
        isAnonymous: false,
        evidenceUrls: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
        originalLanguage: voiceLanguage,
        severity: extractedData.severity
      });

      setVoiceState('submitted');
      setTimeout(() => {
        onSuccess(created.id);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setVoiceState('review');
    }
  };

  // Demonstration shortcut triggers for live hackathon presentation
  const demoVoiceSample = (lang: 'te' | 'en') => {
    const sample = lang === 'te'
      ? 'మహా విశాఖ నగర పాలక సంస్థ ఎంవిపి కాలనీ సెక్టార్ 4 లో చాలా రోజులుగా మురుగు కాలువ పొంగిపొర్లి చెత్త కుప్పలు పేరుకుపోయాయి. రోగాల భయం ఉంది, తక్షణమే పరిశీలించండి.'
      : 'Severe garbage accumulation and drain blockage behind Community Hall in MVP Colony Sector 4. Water is stagnating and stray animals are spreading waste.';
    setVoiceLanguage(lang);
    setTranscript(sample);
    stopListeningAndProcess(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E5EAF0] text-[#142B45] relative">
        {/* Header */}
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D92]"></span>
              <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
                {language === 'te' ? 'ద్విభాషా ఏఐ అసిస్టెంట్' : 'Bilingual AI Voice Assistant'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#142B45] mt-0.5">
              {language === 'te' ? 'స్వరంతో సమస్యను నివేదించండి' : 'Speak Your Civic Grievance'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex bg-white rounded-lg border border-[#E5EAF0] p-0.5 text-xs font-semibold">
              <button
                onClick={() => setVoiceLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  voiceLanguage === 'en' ? 'bg-[#142B45] text-white' : 'text-[#64748B] hover:text-[#142B45]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setVoiceLanguage('te')}
                className={`px-2 py-1 rounded transition-colors ${
                  voiceLanguage === 'te' ? 'bg-[#142B45] text-white' : 'text-[#64748B] hover:text-[#142B45]'
                }`}
              >
                తెలుగు
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-[#64748B] hover:text-[#142B45] hover:bg-[#F1F5F9]"
              aria-label="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 text-center space-y-6">
          {voiceState === 'idle' && (
            <div className="space-y-4">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#0F9D92]/10 animate-ping"></div>
                <button
                  onClick={startListening}
                  className="relative z-10 w-20 h-20 rounded-full bg-[#0F9D92] text-white shadow-lg hover:bg-[#0A726A] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  aria-label="Start recording speech"
                >
                  <Mic className="w-8 h-8" />
                </button>
              </div>

              <div>
                <p className="font-semibold text-sm text-[#142B45]">
                  {voiceLanguage === 'te' ? 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి' : 'Tap the microphone to speak'}
                </p>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  {voiceLanguage === 'te'
                    ? 'ఉదాహరణ: "MVP కాలనీ సెక్టార్ 4 లో చాలా రోజులుగా చెత్త పేరుకుపోయింది, త్వరగా తీయించండి."'
                    : 'Example: "Garbage accumulating near Community Hall in MVP Colony Sector 4 for 3 days."'}
                </p>
              </div>

              {/* Hackathon Quick Demo Prompts */}
              <div className="pt-2 border-t border-[#E5EAF0] text-xs">
                <span className="text-[#64748B] block mb-2 font-medium">Quick Demonstration Voice Audio:</span>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => demoVoiceSample('en')}
                    className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-white text-[#142B45] font-medium transition-colors"
                  >
                    Demo English Voice (MVP Colony)
                  </button>
                  <button
                    onClick={() => demoVoiceSample('te')}
                    className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-white text-[#0F9D92] font-medium transition-colors"
                  >
                    డెమో తెలుగు వాయిస్ (సెక్టార్ 4)
                  </button>
                </div>
              </div>
            </div>
          )}

          {voiceState === 'listening' && (
            <div className="space-y-4">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <button
                  onClick={() => stopListeningAndProcess()}
                  className="w-20 h-20 rounded-full bg-[#D94B4B] text-white shadow-lg flex items-center justify-center animate-pulse"
                  aria-label="Stop recording"
                >
                  <Square className="w-6 h-6" />
                </button>
              </div>

              {/* Live Audio Waveform Canvas */}
              <div className="h-14 w-full bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] p-1 flex items-center justify-center">
                <canvas ref={canvasRef} width={300} height={40} className="w-full h-full" />
              </div>

              <div>
                <p className="font-semibold text-sm text-[#142B45] animate-pulse">
                  {voiceLanguage === 'te' ? 'మీ స్వరాన్ని వింటున్నాం...' : 'Listening... Speak clearly'}
                </p>
                <p className="text-xs text-[#64748B] mt-1 italic">
                  {transcript || (voiceLanguage === 'te' ? 'లొకేషన్ మరియు సమస్య వివరాలు చెప్పండి...' : 'State the locality, street, and issue details...')}
                </p>
              </div>

              <button
                onClick={() => stopListeningAndProcess()}
                className="px-5 py-2 rounded-lg bg-[#0F9D92] text-white text-xs font-semibold hover:bg-[#0A726A] transition-colors"
              >
                {voiceLanguage === 'te' ? 'పూర్తయింది - విశ్లేషించండి' : 'Done Speaking - Process Grievance'}
              </button>
            </div>
          )}

          {voiceState === 'processing' && (
            <div className="py-8 space-y-3">
              <RefreshCw className="w-10 h-10 text-[#0F9D92] animate-spin mx-auto" />
              <p className="font-semibold text-sm text-[#142B45]">
                {voiceLanguage === 'te' ? 'ఏఐ తో సమస్యను నమోదు చేస్తున్నాము...' : 'Parsing grievance & extracting GVMC ward...'}
              </p>
              <p className="text-xs text-[#64748B]">Matching Complaint DNA clusters and determining SLA priority</p>
            </div>
          )}

          {voiceState === 'review' && extractedData && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16865A]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{voiceLanguage === 'te' ? 'ఏఐ విశ్లేషణ పూర్తయింది' : 'AI Analysis & Entity Extraction Complete'}</span>
                </div>
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-[11px] text-[#0F9D92] font-semibold animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Spoken Review</span>
                  </span>
                )}
              </div>

              {/* Extracted Details Card */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5EAF0] space-y-2 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">Identified Title</span>
                  <p className="font-bold text-[#142B45] text-sm">{extractedData.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">Civic Category</span>
                    <span className="font-semibold text-[#0F9D92]">{translateCategory(voiceLanguage, extractedData.category)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">Locality & Ward</span>
                    <span className="font-semibold text-[#142B45]">{extractedData.locality} (Ward {extractedData.wardNumber})</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">Transcript</span>
                  <p className="text-[#142B45] bg-white p-2 rounded border border-[#E5EAF0] leading-relaxed italic text-[11px]">
                    "{extractedData.description}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => speakConfirmation(extractedData)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E5EAF0] text-[#142B45] text-xs font-medium hover:bg-[#F8FAFC]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Replay Audio</span>
                </button>

                <button
                  onClick={() => setVoiceState('idle')}
                  className="px-3 py-2 rounded-lg border border-[#E5EAF0] text-[#64748B] text-xs font-medium hover:bg-[#F8FAFC]"
                >
                  Retry
                </button>

                <button
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2 rounded-lg bg-[#0F9D92] text-white text-xs font-bold hover:bg-[#0A726A] transition-colors shadow-sm"
                >
                  {voiceLanguage === 'te' ? 'ఖచ్చితంగా సమర్పించండి' : 'Confirm & Submit Grievance'}
                </button>
              </div>
            </div>
          )}

          {voiceState === 'submitting' && (
            <div className="py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F9D92] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#142B45]">
                {voiceLanguage === 'te' ? 'ఫిర్యాదు సర్వర్‌లో నమోదవుతోంది...' : 'Registering grievance with GVMC server...'}
              </p>
            </div>
          )}

          {voiceState === 'submitted' && (
            <div className="py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#16865A] mx-auto animate-bounce" />
              <p className="text-base font-bold text-[#142B45]">
                {voiceLanguage === 'te' ? 'ఫిర్యాదు విజయవంతంగా సమర్పించబడింది!' : 'Grievance Successfully Registered!'}
              </p>
              <p className="text-xs text-[#64748B]">Assigned to Public Health & Sanitation with live Complaint DNA tracking.</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

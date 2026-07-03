'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { OrbVisualizer } from '@/components/orb-visualizer';
import { WaveVisualizer } from '@/components/wave-visualizer';
import {
  Mic,
  MicOff,
  PhoneOff,
  Play,
  Volume2,
  VolumeX,
  Clock,
  Loader2,
  Brain,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Topic {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Message {
  speaker: 'candidate' | 'ai';
  text: string;
  timestamp: Date;
}

interface InterviewDetail {
  id: string;
  role: string;
  difficulty: string;
  company: string;
  experience: number;
  status: string;
  startedAt: string;
  objective: string | null;
  personality?: string;
}

export default function InterviewStudioPage() {
  const { id } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const router = useRouter();

  // State management
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Live Coding & Integrity States
  const [code, setCode] = useState('// Write your solutions here...\n\nfunction solve(input) {\n  return input;\n}');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [consoleOutput, setConsoleOutput] = useState('Console output will appear here after clicking "Run Code & Tests"...');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [tabSwitchAlertCount, setTabSwitchAlertCount] = useState(0);

  // Digital Twin, Active Agent, and Contradiction Alert states
  const [activeAgent, setActiveAgent] = useState<string>('Senior Engineer');
  const [digitalTwin, setDigitalTwin] = useState<Record<string, number>>({
    react: 50,
    node: 50,
    systemDesign: 50,
    sql: 50,
    leadership: 50,
    communication: 50,
  });
  const [contradictionAlert, setContradictionAlert] = useState<string | null>(null);

  // WebSocket, WebRTC & Audio References
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const webSocketRef = useRef<WebSocket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  const isAudioOutputMutedRef = useRef(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state values to refs to avoid stale closure traps in AudioContext event loops
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isAudioOutputMutedRef.current = isAudioOutputMuted;
  }, [isAudioOutputMuted]);

  const orbStateRef = useRef<OrbState>('idle');
  useEffect(() => {
    orbStateRef.current = orbState;
  }, [orbState]);

  // Text accumulation buffers
  const currentAiTextRef = useRef<string>('');
  const currentCandidateTextRef = useRef<string>('');

  // Redirect if unauthorized
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch initial interview details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/interviews/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInterview(data.interview);
          if (data.interview.activeAgent) {
            setActiveAgent(data.interview.activeAgent);
          }
          if (data.interview.digitalTwin) {
            setDigitalTwin(data.interview.digitalTwin as Record<string, number>);
          }
          if (data.interview.topics) {
            setTopics(data.interview.topics as Topic[]);
          }
          if (data.interview.messages) {
            const mapped = (data.interview.messages as { speaker: 'candidate' | 'ai'; text: string; timestamp: string }[]).map((m) => ({
              speaker: m.speaker,
              text: m.text,
              timestamp: new Date(m.timestamp),
            }));
            setMessages(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching interview details:', err);
      }
    };
    if (id && user) {
      fetchDetails();
    }
  }, [id, user]);

  // Timer counter effect
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  // Format timer
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to cleanup media and WebRTC/WebSocket connections
  const disconnectSession = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop local mic tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close WebRTC connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close WebSocket
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    // Close recording audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close play audio context
    if (playContextRef.current) {
      playContextRef.current.close();
      playContextRef.current = null;
    }

    processorRef.current = null;

    // Remove video/audio HTML tags
    if (audioElRef.current) {
      audioElRef.current.remove();
      audioElRef.current = null;
    }

    dataChannelRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setOrbState('idle');
  };

  // Turn processor triggers updates to scores and instructions
  const triggerProcessTurn = async (candText: string, aiText: string) => {
    try {
      // Optimistically append messages to UI transcript
      const newCandMsg: Message = { speaker: 'candidate', text: candText, timestamp: new Date() };
      const newAiMsg: Message = { speaker: 'ai', text: aiText, timestamp: new Date() };
      setMessages((prev) => [...prev, newCandMsg, newAiMsg]);

      const res = await fetch(`/api/interviews/${id}/process-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateText: candText, aiText: aiText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topics) {
          setTopics(data.topics);
        }
        if (data.activeAgent) {
          setActiveAgent(data.activeAgent);
        }
        if (data.digitalTwin) {
          setDigitalTwin(data.digitalTwin);
        }
        if (data.contradictionAlert) {
          setContradictionAlert(data.contradictionAlert);
          setTimeout(() => {
            setContradictionAlert((prev) => prev === data.contradictionAlert ? null : prev);
          }, 15000);
        }

        // Send session updates to steer either the WebRTC data channel or the Gemini WebSocket
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          const updateEvent = {
            type: 'session.update',
            session: {
              instructions: data.nextInstructions,
            },
          };
          dataChannelRef.current.send(JSON.stringify(updateEvent));
          console.log('Steering instructions pushed to WebRTC Session successfully.');
        }

        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          const steerMsg = {
            clientContent: {
              turns: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `[SYSTEM NOTE: Please adjust your steering directions for this interview. Guidelines: ${data.nextInstructions}]`,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          };
          webSocketRef.current.send(JSON.stringify(steerMsg));
          console.log('Steering instructions injected into Gemini session history.');
        }
      }
    } catch (err) {
      console.error('Turn processing error:', err);
    }
  };

  // Helper to schedule continuous playback of PCM chunks (24kHz little-endian) from Gemini Live
  const playPcmChunk = (base64Data: string) => {
    if (isAudioOutputMutedRef.current) return;

    try {
      if (!playContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        playContextRef.current = new AudioCtx({ sampleRate: 24000 });
        nextPlayTimeRef.current = playContextRef.current.currentTime;
      }

      const playCtx = playContextRef.current;
      if (playCtx.state === 'suspended') {
        playCtx.resume();
      }

      const raw = atob(base64Data);
      const len = raw.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = raw.charCodeAt(i);
      }

      let buf = bytes.buffer;
      if (buf.byteLength % 2 !== 0) {
        buf = buf.slice(0, buf.byteLength - 1);
      }
      const int16Data = new Int16Array(buf);
      const audioBuffer = playCtx.createBuffer(1, int16Data.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const inv32768 = 1.0 / 32768.0;
      for (let i = 0; i < int16Data.length; i++) {
        channelData[i] = int16Data[i] * inv32768;
      }

      const source = playCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(playCtx.destination);

      let startTime = nextPlayTimeRef.current;
      const minPlayTime = playCtx.currentTime + 0.05;
      if (startTime < minPlayTime) {
        startTime = minPlayTime;
      }
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (e) {
      console.error('Error playing audio chunk:', e);
    }
  };

  // Helper to schedule continuous playback of raw PCM buffer chunks (24kHz little-endian) from Gemini Live binary frames
  const playRawPcmBuffer = (arrayBuffer: ArrayBuffer) => {
    if (isAudioOutputMutedRef.current) return;

    try {
      if (!playContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        playContextRef.current = new AudioCtx({ sampleRate: 24000 });
        nextPlayTimeRef.current = playContextRef.current.currentTime;
      }

      const playCtx = playContextRef.current;
      if (playCtx.state === 'suspended') {
        playCtx.resume();
      }

      let buf = arrayBuffer;
      if (buf.byteLength % 2 !== 0) {
        buf = buf.slice(0, buf.byteLength - 1);
      }
      const int16Data = new Int16Array(buf);
      const audioBuffer = playCtx.createBuffer(1, int16Data.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const inv32768 = 1.0 / 32768.0;
      for (let i = 0; i < int16Data.length; i++) {
        channelData[i] = int16Data[i] * inv32768;
      }

      const source = playCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(playCtx.destination);

      let startTime = nextPlayTimeRef.current;
      const minPlayTime = playCtx.currentTime + 0.05;
      if (startTime < minPlayTime) {
        startTime = minPlayTime;
      }
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (e) {
      console.error('Error playing raw PCM buffer:', e);
    }
  };

  // Helper to log errors back to the server for live diagnostic inspection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logClientError = async (error: any, context: string) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error, context }),
      });
    } catch { /* ignore */ }
  };

  // Connect WebRTC to OpenAI Realtime, or fallback to Gemini Multimodal Live API over WebSockets
  const connectSession = async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    setError('');

    try {
      // 1. Ask for mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // 2. Fetch short-lived ephemeral session token (with backend instructions)
      const sessionTokenRes = await fetch(`/api/interviews/${id}/session`, {
        method: 'POST',
      });

      if (!sessionTokenRes.ok) {
        const errData = await sessionTokenRes.json();
        throw new Error(errData.error || 'Failed to fetch ephemeral token from server.');
      }

      const sessionTokenData = await sessionTokenRes.json();
      const clientToken = sessionTokenData.value;
      const systemInstructions = sessionTokenData.instructions;

      // Reset text buffers
      currentAiTextRef.current = '';
      currentCandidateTextRef.current = '';

      // --- FORCE GOOGLE GEMINI LIVE API OVER WEBSOCKETS BY DEFAULT ---
      if (true) {
        console.warn('OpenAI token is null. Launching Google Gemini Multimodal Live API session fallback...');

        // Fetch Gemini configuration
        const configRes = await fetch('/api/config');
        if (!configRes.ok) {
          throw new Error('Gemini API key not configured on server.');
        }
        const { geminiApiKey } = await configRes.json();

        // Connect to Gemini Live WS Service
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
        const ws = new WebSocket(wsUrl);
        webSocketRef.current = ws;

        ws.addEventListener('open', () => {
          console.log('Gemini Live API WebSocket stream connected successfully.');

          // Send setup payload immediately
          const setupMsg = {
            setup: {
              model: 'models/gemini-2.5-flash-native-audio-latest',
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: 'Aoede',
                    },
                  },
                },
              },
              systemInstruction: {
                parts: [{ text: systemInstructions || 'You are a senior tech interviewer.' }],
              },
            },
          };
          ws.send(JSON.stringify(setupMsg));

          setIsConnected(true);
          setIsConnecting(false);
          setOrbState('thinking');

          // Initialize Web Speech API for local real-time client transcripts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = false;
            rec.lang = 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onresult = (event: any) => {
              let newText = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  newText += event.results[i][0].transcript + ' ';
                }
              }
              if (newText.trim()) {
                currentCandidateTextRef.current += newText;
                console.log('Candidate spoken transcript segment:', newText);
              }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onerror = (e: any) => {
              console.warn('Speech recognition warning:', e.error);
            };

            rec.onend = () => {
              if (webSocketRef.current?.readyState === WebSocket.OPEN) {
                try { rec.start(); } catch { /* ignore */ }
              }
            };

            recognitionRef.current = rec;
            try {
              rec.start();
            } catch (e) {
              console.error('Speech recognition start failed:', e);
            }
          }

          // Initialize Web Audio API downsampler and mic recorder
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            let audioCtx;
            try {
              audioCtx = new AudioCtx({ sampleRate: 16000 });
            } catch {
              audioCtx = new AudioCtx();
            }
            const nativeRate = audioCtx.sampleRate;
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              // Mute mic input when AI is speaking or thinking to prevent echo/feedback loops
              if (orbStateRef.current === 'speaking' || orbStateRef.current === 'thinking') return;

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBuffer = downsampleAndConvertTo16kInt16(inputData, nativeRate);
              const base64Data = arrayBufferToBase64(pcmBuffer.buffer);

              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    realtimeInput: {
                      mediaChunks: [
                        {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64Data,
                        },
                      ],
                    },
                  })
                );
              }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
          } catch (audioErr) {
            console.error('Audio capture pipeline failed:', audioErr);
          }
        });

        ws.addEventListener('message', async (e) => {
          try {
            let dataStr = '';

            if (e.data instanceof Blob) {
              const text = await e.data.text();
              const trimmed = text.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                dataStr = trimmed;
              } else {
                setOrbState('speaking');
                const arrayBuffer = await e.data.arrayBuffer();
                playRawPcmBuffer(arrayBuffer);
                return;
              }
            } else if (typeof e.data === 'string') {
              dataStr = e.data;
            } else if (e.data instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const text = decoder.decode(e.data);
              const trimmed = text.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                dataStr = trimmed;
              } else {
                setOrbState('speaking');
                playRawPcmBuffer(e.data);
                return;
              }
            } else {
              console.warn('Unknown message data type:', typeof e.data);
              return;
            }

            if (!dataStr) return;
            const msg = JSON.parse(dataStr);

            // Handle setupComplete confirmation from server to kick off interview
            if (msg.setupComplete) {
              console.log('Gemini setup complete. Kickstarting mock interview turns...');
              const startMsg = {
                clientContent: {
                  turns: [
                    {
                      role: 'user',
                      parts: [
                        {
                          text: 'Hello! I am ready to start the mock interview. Please introduce yourself and ask the first question based on the interview plan.'
                        }
                      ]
                    }
                  ],
                  turnComplete: true
                }
              };
              ws.send(JSON.stringify(startMsg));
              setOrbState('thinking');
              return;
            }

            if (msg.serverContent) {
              const content = msg.serverContent;

              if (content.modelTurn && content.modelTurn.parts) {
                setOrbState('speaking');
                for (const part of content.modelTurn.parts) {
                  if (part.inlineData) {
                    playPcmChunk(part.inlineData.data);
                  }
                  if (part.text) {
                    currentAiTextRef.current += part.text;
                  }
                }
              }

              if (content.turnComplete) {
                setOrbState('listening');
                console.log('Gemini model turn complete.');

                setTimeout(async () => {
                  const userText = currentCandidateTextRef.current.trim();
                  const aiText = currentAiTextRef.current.trim();

                  if (userText || aiText) {
                    console.log('Processing turn. Candidate:', userText, '| AI:', aiText);
                    await triggerProcessTurn(userText, aiText);

                    // Reset local buffers for next turn
                    currentCandidateTextRef.current = '';
                    currentAiTextRef.current = '';
                  }
                }, 1200);
              }
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            console.error('Error parsing or processing message:', err);
            logClientError({ message: err?.message, stack: err?.stack }, 'WebSocket message handler catch');
          }
        });

        ws.addEventListener('close', (event) => {
          console.log('Gemini WebSocket stream closed.');
          logClientError({ code: event.code, reason: event.reason, wasClean: event.wasClean }, 'WebSocket close event');
          disconnectSession();
        });

        ws.addEventListener('error', (wsErr) => {
          console.error('Gemini WebSocket error:', wsErr);
          logClientError({ message: 'WebSocket error event fired' }, 'WebSocket error event');
          setError('Gemini WebSocket connection encountered an error.');
          disconnectSession();
        });

        return;
      }

      // --- STANDARD OPENAI WEBRTC CONNECTION PATH ---
      console.log('Launching OpenAI Realtime WebRTC connection...');
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Create audio element for playing AI output
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      document.body.appendChild(audioEl);

      // Listen to incoming audio streams from OpenAI
      pc.ontrack = (event) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = event.streams[0];
        }
      };

      // Add local microphone tracks to Peer Connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create WebRTC Data Channel
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      // Handle Data Channel Messages
      dc.addEventListener('message', async (e) => {
        const serverEvent = JSON.parse(e.data);

        switch (serverEvent.type) {
          case 'session.created':
            console.log('OpenAI session created.');
            setIsConnected(true);
            setIsConnecting(false);
            setOrbState('listening');
            break;

          case 'response.created':
            setOrbState('thinking');
            currentAiTextRef.current = '';
            break;

          case 'response.audio_transcript.delta':
            setOrbState('speaking');
            currentAiTextRef.current += serverEvent.delta;
            break;

          case 'conversation.item.input_audio_transcription.completed':
            currentCandidateTextRef.current = serverEvent.transcript || '';
            console.log('Whisper transcribing candidate text:', currentCandidateTextRef.current);
            break;

          case 'response.done':
            setOrbState('listening');
            const userText = currentCandidateTextRef.current.trim();
            const aiText = currentAiTextRef.current.trim();

            console.log('Turn complete. User text:', userText, '| AI text:', aiText);

            if (userText && aiText) {
              triggerProcessTurn(userText, aiText);
              currentCandidateTextRef.current = '';
              currentAiTextRef.current = '';
            } else if (aiText && !userText) {
              setMessages((prev) => [
                ...prev,
                { speaker: 'ai', text: aiText, timestamp: new Date() },
              ]);
              currentAiTextRef.current = '';
            }
            break;

          default:
            break;
        }
      });

      dc.addEventListener('open', () => {
        console.log('Data channel oai-events is open.');
        const initEvent = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            voice: 'alloy',
            instructions: systemInstructions,
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 800,
            },
          },
        };
        dc.send(JSON.stringify(initEvent));
        console.log('Sent initial session configuration on open.');
      });

      dc.addEventListener('close', () => {
        console.log('Data channel closed.');
        disconnectSession();
      });

      // Create WebRTC SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime/calls';
      const model = 'gpt-4o-mini-realtime-preview';

      // SDP Exchange with OpenAI endpoint
      const sdpRes = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientToken}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpRes.ok) {
        const errorDetail = await sdpRes.text();
        console.error('OpenAI WebRTC SDP response error payload:', errorDetail);
        throw new Error(`SDP negotiation failed: ${sdpRes.status} ${sdpRes.statusText} - ${errorDetail}`);
      }

      const answerSdpText = await sdpRes.text();
      const answer = { type: 'answer' as RTCSdpType, sdp: answerSdpText };
      await pc.setRemoteDescription(answer);

      console.log('WebRTC connection established with OpenAI successfully.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to establish audio connection:', err);
      logClientError({ message: err?.message, stack: err?.stack }, 'connectSession catch block');
      const errorMessage = err instanceof Error ? err.message : 'Microphone access denied or connection block.';
      setError(errorMessage);
      disconnectSession();
    }
  };

  const [error, setError] = useState('');

  // Toggle local mic mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle speaker volume mute
  const toggleAudioOutputMute = () => {
    if (audioElRef.current) {
      audioElRef.current.muted = !audioElRef.current.muted;
      setIsAudioOutputMuted(!isAudioOutputMuted);
    }
  };

  // Complete interview and trigger report generation
  const handleEndInterview = async () => {
    if (isEnding) return;
    setIsEnding(true);
    disconnectSession();

    try {
      const res = await fetch(`/api/interviews/${id}/end`, {
        method: 'POST',
      });

      if (res.ok) {
        router.push(`/interview/${id}/report`);
      } else {
        alert('Failed to evaluate interview. Redirecting to dashboard.');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error ending interview:', err);
      router.push('/dashboard');
    }
  };

  const handleRunCode = async () => {
    if (!code) return;
    setIsRunningCode(true);
    setConsoleOutput('Running compilation and validating test cases...');
    try {
      const res = await fetch(`/api/interviews/${id}/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: codeLanguage }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsoleOutput(data.consoleOutput || 'Success');
        setTimeComplexity(data.complexity?.time || 'O(N)');
        setSpaceComplexity(data.complexity?.space || 'O(1)');
      } else {
        setConsoleOutput(`Error: ${data.error || 'Failed to run code'}`);
      }
    } catch (err) {
      console.error('Run code error:', err);
      setConsoleOutput('Sandbox connection lost. Execution timed out.');
    } finally {
      setIsRunningCode(false);
    }
  };

  // Integrity Guardrails
  useEffect(() => {
    if (!isConnected) return;

    const handleVisibility = async () => {
      if (document.hidden) {
        setTabSwitchAlertCount((prev) => prev + 1);
        try {
          await fetch(`/api/interviews/${id}/integrity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              violationType: 'tab_switch',
              details: 'Candidate toggled away from the screen.',
            }),
          });
        } catch {}
        alert('⚠️ Integrity Alert: Focus shift detected. Your activity is reported on the Recruiter Control Panel.');
      }
    };

    const handleBlur = async () => {
      setTabSwitchAlertCount((prev) => prev + 1);
      try {
        await fetch(`/api/interviews/${id}/integrity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            violationType: 'window_blur',
            details: 'Candidate blurred focus from the studio window.',
          }),
        });
      } catch {}
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert('⚠️ Integrity Block: Copy operations are restricted during the assessment.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert('⚠️ Integrity Block: Paste operations are restricted during the assessment.');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isConnected, id]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#050816] overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[10%] left-[-15%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      <div className="absolute bottom-[10%] right-[-15%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      {/* AI Contradiction Alert Overlay */}
      {contradictionAlert && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 w-full z-30">
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-2">
              <span className="animate-ping h-2 w-2 rounded-full bg-yellow-400 inline-block" />
              <span><strong>AI Contradiction Detector:</strong> {contradictionAlert}</span>
            </span>
            <button 
              onClick={() => setContradictionAlert(null)} 
              className="text-[10px] hover:underline font-bold uppercase tracking-wider ml-4 text-yellow-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Studio content container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Panel: Voice Interview Room, HUD & Checklists */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-6">
            
            {/* Header parameters */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">AI Voice Interview Room</h2>
                <p className="text-[10px] text-zinc-550 font-semibold uppercase tracking-wider mt-0.5">
                  {interview?.role} ({interview?.experience} Years) • {interview?.difficulty}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2 border border-zinc-850">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono">{formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Orb Visualizer Container */}
            <div className="flex flex-col items-center justify-center py-6 gap-6 relative">
              <OrbVisualizer state={orbState} />
              <WaveVisualizer active={orbState === 'listening' || orbState === 'speaking'} />
              {error && (
                <p className="text-xs text-red-400 font-medium bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}
            </div>

            {/* AI Thinking Brain HUD */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 shadow-lg shadow-indigo-500/2">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span>Reasoning Engine HUD</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    activeAgent === 'CTO' 
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                      : activeAgent === 'Hiring Manager' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    🎤 Panelist: {activeAgent}
                  </span>
                </span>
                <span className="text-2xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {interview?.personality || 'Google Staff Engineer'} Style
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                {/* Listening State */}
                <div className={`p-2.5 rounded-lg border text-center space-y-1 transition ${
                  orbState === 'listening' 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                    : 'bg-zinc-900/40 border-zinc-900/60 text-zinc-500'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Listening</div>
                  <div className="text-[9px] font-mono">{orbState === 'listening' ? 'MIC_ACTIVE' : 'IDLE'}</div>
                </div>

                {/* Thinking State */}
                <div className={`p-2.5 rounded-lg border text-center space-y-1 transition ${
                  orbState === 'thinking' 
                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-300' 
                    : 'bg-zinc-900/40 border-zinc-900/60 text-zinc-500'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Analyzing</div>
                  <div className="text-[9px] font-mono">{orbState === 'thinking' ? 'PARSING...' : 'STANDBY'}</div>
                </div>

                {/* Speaking State */}
                <div className={`p-2.5 rounded-lg border text-center space-y-1 transition ${
                  orbState === 'speaking' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-zinc-900/40 border-zinc-900/60 text-zinc-500'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Speaking</div>
                  <div className="text-[9px] font-mono">{orbState === 'speaking' ? 'TTS_STREAM' : 'STANDBY'}</div>
                </div>
              </div>

              {tabSwitchAlertCount > 0 && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 text-center text-[10px] font-semibold text-red-400">
                  ⚠️ Integrity violation alerts logged: {tabSwitchAlertCount}
                </div>
              )}
            </div>

            {/* AI Digital Twin Knowledge Model */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 shadow-lg shadow-indigo-500/2">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-indigo-400" />
                  <span>AI Digital Twin Candidate Model</span>
                </span>
                <span className="text-[9px] font-semibold text-zinc-500 uppercase">Estimated Knowledge</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {Object.entries(digitalTwin).map(([skill, val]) => (
                  <div key={skill} className="bg-zinc-900/25 border border-zinc-900/50 rounded-lg p-2 space-y-1">
                    <div className="text-[9px] font-bold text-zinc-400 capitalize truncate">{skill.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white font-mono">{val}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Topics & Live Transcripts Grid row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span>Roadmap Checklist</span>
              </h3>
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {topic.status === 'completed' ? (
                        <span className="block h-3.5 w-3.5 rounded-full bg-emerald-500/20 border border-emerald-500" />
                      ) : topic.status === 'in_progress' ? (
                        <span className="block h-3.5 w-3.5 rounded-full bg-indigo-500/20 border border-indigo-500 animate-pulse" />
                      ) : (
                        <span className="block h-3.5 w-3.5 rounded-full border border-zinc-800" />
                      )}
                    </div>
                    <div className="text-2xs">
                      <p className={`font-semibold ${
                        topic.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-300'
                      }`}>{topic.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Transcript */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm flex flex-col justify-between">
              <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <span>Dialogue Transcript</span>
                </h3>
                <button 
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-2xs text-indigo-400 font-semibold hover:underline"
                >
                  {showTranscript ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex-1 mt-2 overflow-y-auto max-h-[140px] text-[10px] space-y-3 pr-1">
                {showTranscript ? (
                  messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} className={msg.speaker === 'candidate' ? 'text-right' : 'text-left'}>
                        <div className="text-[9px] text-zinc-550 font-bold uppercase">{msg.speaker === 'candidate' ? 'You' : 'AI'}</div>
                        <p className={`inline-block rounded-lg px-2.5 py-1.5 mt-0.5 text-zinc-300 ${
                          msg.speaker === 'candidate' ? 'bg-indigo-600/15 text-indigo-300' : 'bg-zinc-900/60'
                        }`}>{msg.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-zinc-650">No voice transcripts recorded yet.</div>
                  )
                ) : (
                  <div className="text-center py-6 text-zinc-650">Click &quot;Show&quot; to inspect dialogue.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Monaco-style Code & SQL assessment sandbox */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm flex flex-col justify-between min-h-[500px]">
          
          {/* Editor Header controls */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Code Sandbox</h3>
            </div>
            
            <div className="flex items-center gap-2.5">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-2xs text-zinc-350 outline-none focus:border-indigo-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL Query</option>
                <option value="go">Go Lang</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={isRunningCode || !isConnected}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-2xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {isRunningCode ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Run Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coding Workspace textarea */}
          <div className="flex-1 my-4 flex relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden min-h-[280px]">
            <div className="w-10 bg-zinc-900/50 border-r border-zinc-800/45 text-right pr-2 py-4 select-none font-mono text-[10px] text-zinc-650 leading-normal space-y-0.5">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent p-4 outline-none font-mono text-xs text-zinc-200 leading-normal resize-none focus:ring-0"
              placeholder="// Write your code or query here..."
            />
          </div>

          {/* Console / Terminal output */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-2 font-mono text-2xs">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
              <span className="font-semibold text-zinc-550 uppercase tracking-widest">Compiler Terminal Console</span>
              {timeComplexity && (
                <span className="text-[10px] text-indigo-400">
                  Complexity: {timeComplexity} Time | {spaceComplexity} Space
                </span>
              )}
            </div>
            <pre className="text-zinc-400 whitespace-pre-wrap max-h-[100px] overflow-y-auto leading-normal">
              {consoleOutput}
            </pre>
          </div>
        </div>

      </div>

      {/* Bottom Control Bar */}
      <div className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting || isEnding}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Connecting voice...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5" />
                    <span>Start Voice Interview</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={disconnectSession}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                <PhoneOff className="h-4.5 w-4.5 text-red-400" />
                <span>Disconnect Audio</span>
              </button>
            )}

            {/* Mute Input Button */}
            <button
              onClick={toggleMute}
              disabled={!isConnected}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                !isConnected
                  ? 'border-zinc-800/40 text-zinc-650 cursor-not-allowed'
                  : isMuted
                  ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/30'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Mute Output Button */}
            <button
              onClick={toggleAudioOutputMute}
              disabled={!isConnected}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                !isConnected
                  ? 'border-zinc-800/40 text-zinc-650 cursor-not-allowed'
                  : isAudioOutputMuted
                  ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/30'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
              title={isAudioOutputMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {isAudioOutputMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>

          {/* End Interview & Submit */}
          <div>
            <button
              onClick={handleEndInterview}
              disabled={isEnding}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-semibold text-red-400 shadow-sm transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {isEnding ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Evaluating answers...</span>
                </>
              ) : (
                <>
                  <PhoneOff className="h-4.5 w-4.5" />
                  <span>End Interview & Evaluate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to convert ArrayBuffer to Base64 in browser environment
function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Downsample input float32 array from nativeRate to 16000Hz PCM Int16
function downsampleAndConvertTo16kInt16(
  buffer: Float32Array,
  nativeRate: number
): Int16Array {
  const targetRate = 16000;
  if (nativeRate === targetRate) {
    const pcm = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm;
  }

  const sampleRateRatio = nativeRate / targetRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    const sample = count > 0 ? accum / count : 0;
    const s = Math.max(-1, Math.min(1, sample));
    result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7FFF;

    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

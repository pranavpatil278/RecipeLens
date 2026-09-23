import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as THREE from 'three';
import { ChevronDown, Lightbulb, Mic, Plus, Send, Sparkles, X } from 'lucide-react';
import { AssistantMessage } from '../types';
import { apiClient } from '../services/apiClient';

interface SpaceTransitionProps {
  onComplete: () => void;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function SpaceTransition({ onComplete }: SpaceTransitionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoComplete, setIsVideoComplete] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const playVideo = () => {
      void video.play().catch(() => undefined);
    };
    if (!isVideoComplete) {
      video.addEventListener('loadeddata', playVideo);
      playVideo();
    }
    const finishTimer = isVideoComplete ? window.setTimeout(onComplete, 700) : null;
    return () => {
      video.removeEventListener('loadeddata', playVideo);
      if (finishTimer !== null) window.clearTimeout(finishTimer);
    };
  }, [isVideoComplete, onComplete]);

  return (
    <motion.div className={`chef-transition ${isVideoComplete ? 'chef-transition--complete' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <video
        ref={videoRef}
        className="chef-transition__video"
        src="/chef-portal-transition.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setIsVideoComplete(true)}
        aria-hidden="true"
      />
      <div className="chef-transition__vignette" />
    </motion.div>
  );
}

function RobotKitchen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 8.8);
    camera.lookAt(0, 1.8, 0);
    scene.add(new THREE.AmbientLight(0x6e8bb8, 1.5));
    const key = new THREE.PointLight(0x9ed7ff, 18, 16);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const warm = new THREE.PointLight(0xff8b42, 12, 8);
    warm.position.set(1.5, 1, 2);
    scene.add(warm);
    const kitchen = new THREE.Group();
    scene.add(kitchen);
    const metal = new THREE.MeshStandardMaterial({ color: 0x8ca8ba, metalness: 0.8, roughness: 0.26 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x182733, metalness: 0.85, roughness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x55b7dd, emissive: 0x0c3c58, emissiveIntensity: 1.4, transparent: true, opacity: 0.82 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xd7e7ec, metalness: 0.25, roughness: 0.42 });
    const addBox = (size: [number, number, number], position: [number, number, number], material: THREE.Material, parent = kitchen) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    addBox([6.5, 0.28, 2.2], [0, -0.1, 0], darkMetal);
    addBox([6.5, 1.8, 0.18], [0, 2.6, -0.9], darkMetal);
    const robot = new THREE.Group();
    robot.position.set(-0.6, 0.15, 0.3);
    kitchen.add(robot);
    addBox([1.25, 1.6, 0.72], [0, 1.2, 0], darkMetal, robot);
    const chestGlow = addBox([0.72, 0.5, 0.04], [0, 1.35, 0.38], glass, robot);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), metal);
    head.scale.set(1, 0.84, 0.84);
    head.position.set(0, 2.55, 0);
    robot.add(head);
    addBox([0.55, 0.12, 0.05], [0, 2.55, 0.49], glass, robot);
    const armLeft = new THREE.Group();
    armLeft.position.set(-0.78, 1.75, 0);
    robot.add(armLeft);
    addBox([0.22, 1.45, 0.25], [0, -0.48, 0], metal, armLeft);
    const armRight = new THREE.Group();
    armRight.position.set(0.78, 1.75, 0);
    robot.add(armRight);
    addBox([0.22, 1.45, 0.25], [0, -0.48, 0], metal, armRight);
    addBox([0.32, 0.22, 0.32], [-0.78, 0.1, 0], skin, robot);
    addBox([0.32, 0.22, 0.32], [0.78, 0.1, 0], skin, robot);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.68, 0.14, 32), darkMetal);
    pan.position.set(1.35, 0.22, 0.55);
    kitchen.add(pan);
    const panHandle = addBox([1.1, 0.1, 0.12], [2.2, 0.28, 0.55], darkMetal);
    panHandle.rotation.z = -0.08;
    const food = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 10), new THREE.MeshStandardMaterial({ color: 0xe58c38, emissive: 0x5d2d10, emissiveIntensity: 0.8 }));
    food.scale.y = 0.35;
    food.position.set(1.35, 0.36, 0.55);
    kitchen.add(food);
    const steam = new THREE.Group();
    kitchen.add(steam);
    for (let index = 0; index < 10; index += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.07 + Math.random() * 0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc8efff, transparent: true, opacity: 0.28 }));
      puff.position.set(1.15 + Math.random() * 0.45, 0.55 + Math.random() * 0.7, 0.5 + Math.random() * 0.25);
      steam.add(puff);
    }
    let frame = 0;
    const started = performance.now();
    const animate = (now: number) => {
      const t = (now - started) / 1000;
      armRight.rotation.z = -0.35 + Math.sin(t * 2.2) * 0.28;
      armLeft.rotation.z = 0.12 + Math.sin(t * 1.45 + 1) * 0.1;
      head.rotation.y = Math.sin(t * 0.7) * 0.16;
      chestGlow.material = glass;
      chestGlow.scale.x = 1 + Math.sin(t * 3) * 0.04;
      pan.rotation.y = Math.sin(t * 1.8) * 0.06;
      food.position.y = 0.36 + Math.abs(Math.sin(t * 2.4)) * 0.035;
      steam.children.forEach((puff, index) => {
        puff.position.y += 0.003 + index * 0.0002;
        puff.position.x += Math.sin(t + index) * 0.0008;
        if (puff.position.y > 1.8) puff.position.y = 0.55;
      });
      kitchen.rotation.y = Math.sin(t * 0.22) * 0.045;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} className="chef-lab__robot" aria-hidden="true" />;
}

export function ChefLabExperience({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 'lab_intro', sender: 'assistant', text: 'Welcome to the AI Chef Lab. Ask me about ingredients, temperatures, substitutions, or your next cooking move.', timestamp: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [mode, setMode] = useState('Balanced');
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; url: string; file: File } | null>(null);
  const modeOptions = [
    { label: 'Quick answer', description: 'Fast, direct cooking guidance' },
    { label: 'Balanced', description: 'Practical detail for most questions' },
    { label: 'DeepThink', description: 'Careful reasoning and tradeoffs' },
    { label: 'Research', description: 'Thorough, evidence-aware answers' },
  ];
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sendMessage = async (value: string) => {
    const text = value.trim() || (attachedImage ? 'Please analyze this food image and tell me what I can cook.' : '');
    if (!text || isTyping) return;
    setMessages((current) => [...current, { id: `user_${Date.now()}`, sender: 'user', text, timestamp: 'Now' }]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await apiClient.askAssistant('global-chef', text, undefined, { mode, image: attachedImage?.file });
      setMessages((current) => [...current, response]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: error instanceof Error ? error.message : 'The AI Chef could not answer right now. Please try again.',
        timestamp: 'Now',
      }]);
    } finally {
      setIsTyping(false);
      setAttachedImage(null);
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => () => {
    if (attachedImage) URL.revokeObjectURL(attachedImage.url);
    recognitionRef.current?.stop();
  }, [attachedImage]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessages((current) => [...current, { id: `voice_${Date.now()}`, sender: 'assistant', text: 'Voice input is not supported in this browser. Please use Chrome or Edge, or type your question instead.', timestamp: 'Now' }]);
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <motion.div className="chef-lab">
      <video
        className="chef-lab__background-video"
        src="/ai-chef-kitchen-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="chef-lab__background-shade" aria-hidden="true" />
      <button type="button" onClick={onClose} className="chef-lab__close" aria-label="Exit AI Chef Lab"><X className="w-4 h-4" /></button>
      <motion.main className="chef-lab__workspace" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        <form className="chef-lab__composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(input); }}>
          <input
            ref={galleryInputRef}
            className="chef-lab__gallery-input"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setAttachedImage({ name: file.name, url: URL.createObjectURL(file), file });
              event.target.value = '';
            }}
            aria-label="Choose an image from your gallery"
          />
          <input autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask anything..." aria-label="Ask anything" />
          {attachedImage && (
            <div className="chef-lab__attachment">
              <img src={attachedImage.url} alt="Selected gallery image" />
              <span>{attachedImage.name}</span>
              <button type="button" onClick={() => setAttachedImage(null)} aria-label="Remove attached image"><X className="w-3 h-3" /></button>
            </div>
          )}
          <div className="chef-lab__toolbar">
            <button type="button" className="chef-lab__icon-button" onClick={() => galleryInputRef.current?.click()} aria-label="Open gallery"><Plus className="w-4 h-4" /></button>
            <div className="chef-lab__mode-wrap">
              <button type="button" className="chef-lab__mode-button" onClick={() => setIsModeMenuOpen((open) => !open)} aria-expanded={isModeMenuOpen}>
                <Sparkles className="w-3.5 h-3.5" /> {mode} <ChevronDown className="w-3 h-3" />
              </button>
              {isModeMenuOpen && (
                <div className="chef-lab__mode-menu">
                  {modeOptions.map((option) => (
                    <button key={option.label} type="button" className={option.label === mode ? 'is-selected' : ''} onClick={() => { setMode(option.label); setIsModeMenuOpen(false); }}>
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span className="chef-lab__mode-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="chef-lab__toolbar-spacer" />
            <button type="button" className={`chef-lab__mode-button ${isListening ? 'is-listening' : ''}`} onClick={toggleVoiceInput} aria-label={isListening ? 'Stop voice input' : 'Voice input'}><Mic className="w-3.5 h-3.5" /> {isListening ? 'Listening...' : 'Voice'}</button>
            <button type="submit" className="chef-lab__send" disabled={(!input.trim() && !attachedImage) || isTyping} aria-label="Send message"><Send className="w-4 h-4" /></button>
          </div>
        </form>
        <div className="chef-lab__messages" aria-live="polite">
          {messages.length > 1 && messages.slice(1).map((message) => (
            <div key={message.id} className={`chef-lab__message ${message.sender === 'assistant' ? 'chef-lab__message--assistant' : 'chef-lab__message--user'}`}>
              <span>{message.sender === 'user' ? 'You' : 'AI Chef'}</span>
              {message.sender === 'assistant' ? (
                <div className="chef-lab__markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                </div>
              ) : <p>{message.text}</p>}
            </div>
          ))}
          {isTyping && <div className="chef-lab__message"><span>AI Chef</span><p>Thinking...</p></div>}
          <div ref={messagesEndRef} />
        </div>
      </motion.main>
    </motion.div>
  );
}

export function ChefLabTransition({ onComplete }: SpaceTransitionProps) {
  return <SpaceTransition onComplete={onComplete} />;
}

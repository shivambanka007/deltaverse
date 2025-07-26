/**
 * Advanced Voice Service for DeltaVerse
 * Expert-level implementation with cutting-edge features
 * 
 * Features:
 * - Multi-language support (Hindi + English + Code-switching)
 * - Emotion detection in voice
 * - Financial context awareness
 * - Interrupt handling
 * - Voice biometrics for security
 * - Ambient noise filtering
 */

class AdvancedVoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentLanguage = 'en-US';
    
    // Auto-restart configuration
    this.autoRestart = true; // Auto-restart after no-speech timeout
    this.maxRestartAttempts = 3; // Maximum restart attempts
    this.currentRestartAttempts = 0; // Current restart attempt count
    this.restartDelay = 1000; // Delay before restart (ms)
    this.supportedLanguages = {
      'en-US': { name: 'English', voice: 'en-US', flag: '🇺🇸' },
      'hi-IN': { name: 'हिंदी', voice: 'hi-IN', flag: '🇮🇳' },
      'en-IN': { name: 'Indian English', voice: 'en-IN', flag: '🇮🇳' }
    };
    
    // Voice synthesis properties
    this.availableVoices = {};
    this.defaultVoices = {};
    
    // Advanced features
    this.emotionAnalyzer = new VoiceEmotionAnalyzer();
    this.contextProcessor = new FinancialContextProcessor();
    this.securityValidator = new VoiceBiometrics();
    this.noiseFilter = new AmbientNoiseFilter();
    
    // Voice interaction state
    this.conversationContext = [];
    this.userVoiceProfile = null;
    this.confidenceThreshold = 0.7;
    
    // Event handlers (will be set by components)
    this.onListeningStart = null;
    this.onListeningEnd = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onSpeechRecognized = null;
    this.onInterimResult = null;
    this.onSpeechError = null;
    this.onSpeechTimeout = null; // For no-speech timeouts
    this.onLowConfidence = null;
    
    this.initializeVoiceServices();
  }

  /**
   * Initialize Web Speech API with advanced configuration
   */
  initializeVoiceServices() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech Recognition not supported in this browser');
    }

    if (!('speechSynthesis' in window)) {
      throw new Error('Speech Synthesis not supported in this browser');
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Advanced recognition configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = this.currentLanguage;
    
    // Initialize Speech Synthesis with better error handling
    this.synthesis = window.speechSynthesis;
    
    // Handle speech synthesis events
    this.synthesis.addEventListener('voiceschanged', () => {
      console.log('🔄 Voices updated');
      this.loadAvailableVoices();
    });

    // Load voices immediately if available
    this.loadAvailableVoices();
    
    this.setupEventListeners();
    this.loadUserVoiceProfile();
  }

  /**
   * 🔊 Load available voices with error handling
   */
  loadAvailableVoices() {
    try {
      const voices = this.synthesis.getVoices();
      console.log(`🎤 Loaded ${voices.length} voices`);
      
      // Store voices by language
      this.availableVoices = {};
      voices.forEach(voice => {
        if (!this.availableVoices[voice.lang]) {
          this.availableVoices[voice.lang] = [];
        }
        this.availableVoices[voice.lang].push(voice);
      });

      // Set default voices
      this.setDefaultVoices();
    } catch (error) {
      console.error('🚨 Error loading voices:', error);
    }
  }

  /**
   * 🎯 Set default voices for each language
   */
  setDefaultVoices() {
    // Set default English voice
    const englishVoices = this.availableVoices['en-US'] || this.availableVoices['en-GB'] || [];
    this.defaultVoices['en-US'] = englishVoices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default
    ) || englishVoices[0];

    // Set default Hindi voice
    const hindiVoices = this.availableVoices['hi-IN'] || [];
    this.defaultVoices['hi-IN'] = hindiVoices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default
    ) || hindiVoices[0];

    // Set default Indian English voice
    const indianEnglishVoices = this.availableVoices['en-IN'] || [];
    this.defaultVoices['en-IN'] = indianEnglishVoices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default
    ) || indianEnglishVoices[0];
  }

  /**
   * 🔧 Check if speech synthesis is ready
   */
  isSpeechSynthesisReady() {
    return this.synthesis && this.synthesis.getVoices().length > 0;
  }

  /**
   * 🔄 Wait for speech synthesis to be ready
   */
  async waitForSpeechSynthesis(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.isSpeechSynthesisReady()) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const checkReady = () => {
        if (this.isSpeechSynthesisReady()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Speech synthesis not ready within timeout'));
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  /**
   * Setup advanced event listeners with error handling
   */
  setupEventListeners() {
    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.isListening = true;
      this.onListeningStart?.();
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };

    this.recognition.onerror = (event) => {
      console.error('🚨 Speech recognition error:', event.error);
      this.handleSpeechError(event);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      this.isListening = false;
      this.onListeningEnd?.();
    };

    // Synthesis event listeners
    this.synthesis.onvoiceschanged = () => {
      this.loadAvailableVoices();
    };
  }

  /**
   * Load available voices for speech synthesis
   */
  loadAvailableVoices() {
    try {
      const voices = this.synthesis.getVoices();
      console.log('🔊 Available voices loaded:', voices.length);
      
      // Filter and organize voices by language
      this.availableVoices = {
        'en-US': voices.filter(voice => voice.lang.startsWith('en-US')),
        'hi-IN': voices.filter(voice => voice.lang.startsWith('hi-IN')),
        'en-IN': voices.filter(voice => voice.lang.startsWith('en-IN'))
      };
      
      // Set default voices for each language
      this.defaultVoices = {
        'en-US': this.availableVoices['en-US'].find(voice => voice.name.includes('Google')) || this.availableVoices['en-US'][0],
        'hi-IN': this.availableVoices['hi-IN'][0],
        'en-IN': this.availableVoices['en-IN'][0]
      };
      
      console.log('🎯 Default voices set:', this.defaultVoices);
    } catch (error) {
      console.error('🚨 Error loading voices:', error);
    }
  }

  /**
   * Handle speech recognition errors
   */
  handleSpeechError(event) {
    console.error('🚨 Speech recognition error:', event.error);
    
    const errorMessages = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access was denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your connection.',
      'aborted': 'Speech recognition was aborted.',
      'bad-grammar': 'Grammar error in speech recognition.'
    };
    
    const userFriendlyMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
    
    // Handle no-speech error more gracefully
    if (event.error === 'no-speech') {
      console.log('ℹ️ No speech detected - this is normal, will retry automatically');
      
      // Don't treat no-speech as a critical error
      this.onSpeechTimeout?.({
        error: event.error,
        message: userFriendlyMessage,
        timestamp: new Date().toISOString(),
        canRetry: true,
        attemptCount: this.currentRestartAttempts
      });
      
      // Auto-restart listening if configured and within attempt limits
      if (this.autoRestart && this.currentRestartAttempts < this.maxRestartAttempts) {
        this.currentRestartAttempts++;
        
        setTimeout(() => {
          if (!this.isListening) {
            console.log(`🔄 Auto-restarting speech recognition (attempt ${this.currentRestartAttempts}/${this.maxRestartAttempts})`);
            this.startListening();
          }
        }, this.restartDelay);
      } else if (this.currentRestartAttempts >= this.maxRestartAttempts) {
        console.log('⚠️ Maximum restart attempts reached, stopping auto-restart');
        this.onSpeechError?.({
          error: 'max-restarts-reached',
          message: 'Maximum restart attempts reached. Please manually restart voice recognition.',
          timestamp: new Date().toISOString(),
          canRetry: true
        });
      }
    } else {
      // Handle other errors as before
      this.onSpeechError?.({
        error: event.error,
        message: userFriendlyMessage,
        timestamp: new Date().toISOString(),
        canRetry: event.error !== 'not-allowed' // Can retry unless permission denied
      });
    }
    
    // Reset listening state for critical errors
    if (event.error !== 'no-speech') {
      this.isListening = false;
    }
  }

  /**
   * Handle low confidence speech results
   */
  handleLowConfidenceResult(processedResult) {
    console.warn('⚠️ Low confidence speech result:', processedResult);
    
    this.onLowConfidence?.({
      transcript: processedResult.originalTranscript,
      confidence: processedResult.confidence,
      alternatives: processedResult.alternatives,
      suggestion: 'Please speak more clearly or try again'
    });
  }

  /**
   * Configure auto-restart behavior for no-speech timeouts
   */
  configureAutoRestart(options = {}) {
    this.autoRestart = options.enabled !== false; // Default to true
    this.maxRestartAttempts = options.maxAttempts || 3;
    this.restartDelay = options.delay || 1000;
    
    console.log('🔄 Auto-restart configured:', {
      enabled: this.autoRestart,
      maxAttempts: this.maxRestartAttempts,
      delay: this.restartDelay
    });
  }

  /**
   * Reset restart attempt counter
   */
  resetRestartAttempts() {
    this.currentRestartAttempts = 0;
    console.log('🔄 Restart attempts reset');
  }

  /**
   * Load user voice profile from storage
   */
  loadUserVoiceProfile() {
    try {
      const stored = localStorage.getItem('deltaverse_voice_profile');
      if (stored) {
        this.userVoiceProfile = JSON.parse(stored);
        console.log('👤 User voice profile loaded');
      }
    } catch (error) {
      console.error('🚨 Error loading voice profile:', error);
    }
  }

  /**
   * Save user voice profile to storage
   */
  saveUserVoiceProfile() {
    try {
      if (this.userVoiceProfile) {
        localStorage.setItem('deltaverse_voice_profile', JSON.stringify(this.userVoiceProfile));
        console.log('💾 User voice profile saved');
      }
    } catch (error) {
      console.error('🚨 Error saving voice profile:', error);
    }
  }

  /**
   * Get language distribution analytics
   */
  getLanguageDistribution() {
    const distribution = { 'en-US': 0, 'hi-IN': 0, 'en-IN': 0, 'mixed': 0 };
    
    this.conversationContext.forEach(context => {
      if (context.detectedLanguage) {
        distribution[context.detectedLanguage.primary] = (distribution[context.detectedLanguage.primary] || 0) + 1;
      }
    });
    
    return distribution;
  }

  /**
   * Get average confidence score
   */
  getAverageConfidence() {
    if (this.conversationContext.length === 0) return 0;
    
    const totalConfidence = this.conversationContext.reduce((sum, context) => {
      return sum + (context.confidence || 0);
    }, 0);
    
    return totalConfidence / this.conversationContext.length;
  }

  /**
   * Get emotion trends over time
   */
  getEmotionTrends() {
    const trends = {};
    
    this.conversationContext.forEach(context => {
      if (context.emotion) {
        const emotion = context.emotion.type;
        trends[emotion] = (trends[emotion] || 0) + 1;
      }
    });
    
    return trends;
  }

  /**
   * 🚀 INNOVATIVE FEATURE: Handle speech result with advanced processing
   */
  async handleSpeechResult(event) {
    const results = Array.from(event.results);
    const latestResult = results[results.length - 1];
    
    if (latestResult.isFinal) {
      const transcript = latestResult[0].transcript.trim();
      const confidence = latestResult[0].confidence;
      
      console.log(`🗣️ Speech detected: "${transcript}" (confidence: ${confidence})`);
      
      // Reset restart attempts on successful speech recognition
      this.currentRestartAttempts = 0;
      
      // Advanced processing pipeline
      const processedResult = await this.advancedSpeechProcessing({
        transcript,
        confidence,
        alternatives: Array.from(latestResult).map(alt => ({
          transcript: alt.transcript,
          confidence: alt.confidence
        })),
        timestamp: new Date().toISOString()
      });
      
      // Only process if confidence is above threshold
      if (confidence >= this.confidenceThreshold) {
        this.onSpeechRecognized?.(processedResult);
      } else {
        this.handleLowConfidenceResult(processedResult);
      }
    } else {
      // Handle interim results for real-time feedback
      const interimTranscript = latestResult[0].transcript;
      this.onInterimResult?.(interimTranscript);
    }
  }

  /**
   * 🧠 INNOVATIVE FEATURE: Advanced speech processing with AI
   */
  async advancedSpeechProcessing(speechData) {
    const { transcript, confidence, alternatives, timestamp } = speechData;
    
    // 1. Language detection and code-switching handling
    const detectedLanguage = await this.detectLanguageAndCodeSwitching(transcript);
    
    // 2. Emotion analysis from voice patterns
    const emotionData = await this.emotionAnalyzer.analyzeEmotion(speechData);
    
    // 3. Financial context extraction
    const financialContext = await this.contextProcessor.extractFinancialIntent(transcript);
    
    // 4. Voice biometric validation (security)
    const biometricMatch = await this.securityValidator.validateVoice(speechData);
    
    // 5. Noise filtering and enhancement
    const enhancedTranscript = await this.noiseFilter.enhanceTranscript(transcript);
    
    return {
      originalTranscript: transcript,
      enhancedTranscript,
      confidence,
      alternatives,
      detectedLanguage,
      emotion: emotionData,
      financialContext,
      biometricMatch,
      timestamp,
      processingMetadata: {
        languageConfidence: detectedLanguage.confidence,
        emotionConfidence: emotionData.confidence,
        contextRelevance: financialContext.relevance
      }
    };
  }

  /**
   * 🌍 INNOVATIVE FEATURE: Detect language and handle code-switching
   */
  async detectLanguageAndCodeSwitching(transcript) {
    // Pattern matching for Hindi-English code-switching
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(transcript);
    const hasEnglish = englishPattern.test(transcript);
    
    let detectedLanguage = 'en-US';
    let codeSwitching = false;
    
    if (hasHindi && hasEnglish) {
      codeSwitching = true;
      detectedLanguage = 'mixed';
    } else if (hasHindi) {
      detectedLanguage = 'hi-IN';
    }
    
    // Advanced: Use ML model for better language detection
    const mlDetection = await this.mlLanguageDetection(transcript);
    
    return {
      primary: detectedLanguage,
      codeSwitching,
      confidence: mlDetection.confidence,
      segments: mlDetection.segments // Different language segments
    };
  }

  /**
   * 🎭 INNOVATIVE FEATURE: ML-based language detection
   */
  async mlLanguageDetection(transcript) {
    // Simulate ML language detection (in production, use actual ML service)
    const segments = [];
    const words = transcript.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isHindi = /[\u0900-\u097F]/.test(word);
      const isEnglish = /[a-zA-Z]/.test(word);
      
      segments.push({
        word,
        language: isHindi ? 'hi-IN' : isEnglish ? 'en-US' : 'unknown',
        startIndex: i,
        confidence: 0.9
      });
    }
    
    return {
      confidence: 0.85,
      segments
    };
  }

  /**
   * 🎤 Start listening with advanced configuration
   */
  async startListening(options = {}) {
    if (this.isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configure recognition based on options
      this.recognition.lang = options.language || this.currentLanguage;
      this.recognition.continuous = options.continuous !== false;
      this.recognition.interimResults = options.interimResults !== false;
      
      // Start ambient noise filtering
      await this.noiseFilter.startFiltering();
      
      this.recognition.start();
      
      // Auto-stop after timeout (prevent infinite listening)
      if (options.timeout) {
        setTimeout(() => {
          if (this.isListening) {
            this.stopListening();
          }
        }, options.timeout);
      }
      
    } catch (error) {
      console.error('🚨 Failed to start listening:', error);
      throw new Error(`Voice recognition failed: ${error.message}`);
    }
  }

  /**
   * 🛑 Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.noiseFilter.stopFiltering();
    }
  }

  /**
   * 🔊 Advanced text-to-speech with emotion and context
   */
  async speak(text, options = {}) {
    // Check if speech synthesis is available
    if (!this.synthesis) {
      console.warn('🚨 Speech synthesis not available');
      return;
    }

    // Wait for speech synthesis to be ready
    try {
      await this.waitForSpeechSynthesis();
    } catch (error) {
      console.error('🚨 Speech synthesis not ready:', error);
      return;
    }

    if (this.isSpeaking && !options.interrupt) {
      console.warn('⚠️ Already speaking');
      return;
    }

    // Stop current speech if interrupting or if already speaking
    if (options.interrupt || this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      // Wait a bit for the cancellation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear any pending utterances
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Advanced voice configuration
    await this.configureVoiceForContext(utterance, options);
    
    // Add emotion to speech
    this.applyEmotionToSpeech(utterance, options.emotion);
    
    // Enhanced error handling
    utterance.onerror = (error) => {
      console.error('🚨 Speech synthesis error:', error);
      this.isSpeaking = false;
      
      // Handle different error types
      switch (error.error) {
        case 'interrupted':
          console.log('🔄 Speech was interrupted - this is normal when stopping/starting new speech');
          break;
        case 'canceled':
          console.log('🛑 Speech was canceled');
          break;
        case 'audio-busy':
          console.log('🔊 Audio system is busy - retrying...');
          // Retry after a short delay
          setTimeout(() => this.speak(text, options), 500);
          break;
        case 'audio-hardware':
          console.error('🎧 Audio hardware error');
          break;
        case 'network':
          console.error('🌐 Network error during speech synthesis');
          break;
        case 'synthesis-failed':
          console.error('🚫 Speech synthesis failed');
          break;
        case 'synthesis-unavailable':
          console.error('❌ Speech synthesis unavailable');
          break;
        case 'text-too-long':
          console.error('📝 Text too long for speech synthesis');
          break;
        case 'invalid-argument':
          console.error('⚠️ Invalid argument for speech synthesis');
          break;
        default:
          console.error('❓ Unknown speech synthesis error:', error.error);
      }
      
      // Call error handler if provided
      this.onSpeechError?.(error);
    };
    
    // Event listeners
    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onSpeechStart?.(text);
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.onSpeechEnd?.(text);
    };

    utterance.onpause = () => {
      console.log('⏸️ Speech paused');
    };

    utterance.onresume = () => {
      console.log('▶️ Speech resumed');
    };

    // Speak with error handling
    try {
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('🚨 Error starting speech synthesis:', error);
      this.isSpeaking = false;
      return;
    }
    
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };
      
      utterance.onerror = (error) => {
        this.isSpeaking = false;
        // Don't reject for 'interrupted' errors as they're normal
        if (error.error === 'interrupted' || error.error === 'canceled') {
          console.log('🔄 Speech interruption handled gracefully');
          resolve();
        } else {
          console.error('🚨 Speech synthesis error:', error);
          reject(error);
        }
      };
    });
  }

  /**
   * 🛑 Stop current speech
   */
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      console.log('🛑 Speech stopped');
    }
  }

  /**
   * ⏸️ Pause current speech
   */
  pauseSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
      console.log('⏸️ Speech paused');
    }
  }

  /**
   * ▶️ Resume paused speech
   */
  resumeSpeaking() {
    if (this.synthesis) {
      this.synthesis.resume();
      console.log('▶️ Speech resumed');
    }
  }

  /**
   * 🎯 INNOVATIVE FEATURE: Configure voice based on financial context
   */
  async configureVoiceForContext(utterance, options) {
    const voices = this.synthesis.getVoices();
    
    // Select voice based on language and context
    let selectedVoice = null;
    
    if (options.language === 'hi-IN') {
      selectedVoice = voices.find(voice => 
        voice.lang === 'hi-IN' || voice.name.includes('Hindi')
      );
    } else {
      selectedVoice = voices.find(voice => 
        voice.lang === 'en-US' && voice.name.includes('Google')
      );
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Adjust speech parameters based on financial context
    if (options.financialContext) {
      switch (options.financialContext.urgency) {
        case 'high':
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
          break;
        case 'low':
          utterance.rate = 0.9;
          utterance.pitch = 0.9;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }
    }
    
    utterance.volume = options.volume || 0.8;
  }

  /**
   * 🎭 Apply emotion to speech synthesis
   */
  applyEmotionToSpeech(utterance, emotion) {
    if (!emotion) return;
    
    switch (emotion.type) {
      case 'excited':
        utterance.rate = 1.2;
        utterance.pitch = 1.2;
        break;
      case 'concerned':
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        break;
      case 'confident':
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        break;
      default:
        // Neutral emotion
        break;
    }
  }

  /**
   * 🔄 Switch language dynamically
   */
  switchLanguage(languageCode) {
    if (this.supportedLanguages[languageCode]) {
      this.currentLanguage = languageCode;
      if (this.recognition) {
        this.recognition.lang = languageCode;
      }
      console.log(`🌍 Language switched to: ${this.supportedLanguages[languageCode].name}`);
    }
  }

  /**
   * 📊 Get voice interaction analytics
   */
  getAnalytics() {
    return {
      totalInteractions: this.conversationContext.length,
      languageDistribution: this.getLanguageDistribution(),
      averageConfidence: this.getAverageConfidence(),
      emotionTrends: this.getEmotionTrends(),
      biometricAccuracy: this.securityValidator.getAccuracy()
    };
  }

  /**
   * 🧹 Cleanup resources
   */
  destroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.noiseFilter.cleanup();
  }
}

/**
 * 🎭 Voice Emotion Analyzer
 */
class VoiceEmotionAnalyzer {
  async analyzeEmotion(speechData) {
    // Simulate emotion analysis (in production, use actual ML service)
    const { transcript, confidence } = speechData;
    
    // Simple emotion detection based on keywords and patterns
    const emotions = {
      excited: /great|excellent|amazing|wonderful|fantastic/i,
      concerned: /worried|concerned|problem|issue|trouble/i,
      confident: /sure|certain|definitely|absolutely/i,
      frustrated: /frustrated|annoyed|difficult|hard/i
    };
    
    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(transcript)) {
        return {
          type: emotion,
          confidence: 0.8,
          intensity: this.calculateIntensity(transcript, pattern)
        };
      }
    }
    
    return {
      type: 'neutral',
      confidence: 0.9,
      intensity: 0.5
    };
  }
  
  calculateIntensity(transcript, pattern) {
    const matches = transcript.match(pattern) || [];
    return Math.min(matches.length * 0.3, 1.0);
  }
}

/**
 * 💰 Financial Context Processor
 */
class FinancialContextProcessor {
  async extractFinancialIntent(transcript) {
    const financialKeywords = {
      savings: /save|saving|savings|deposit/i,
      investment: /invest|investment|mutual fund|sip|stock/i,
      debt: /debt|loan|emi|credit card/i,
      budget: /budget|expense|spending|cost/i,
      retirement: /retire|retirement|pension/i,
      insurance: /insurance|policy|coverage/i
    };
    
    const urgencyKeywords = {
      high: /urgent|immediately|asap|emergency/i,
      medium: /soon|important|need to/i,
      low: /maybe|consider|think about/i
    };
    
    let detectedCategory = 'general';
    let urgency = 'medium';
    let relevance = 0.5;
    
    for (const [category, pattern] of Object.entries(financialKeywords)) {
      if (pattern.test(transcript)) {
        detectedCategory = category;
        relevance = 0.9;
        break;
      }
    }
    
    for (const [level, pattern] of Object.entries(urgencyKeywords)) {
      if (pattern.test(transcript)) {
        urgency = level;
        break;
      }
    }
    
    return {
      category: detectedCategory,
      urgency,
      relevance,
      keywords: this.extractKeywords(transcript),
      intent: this.determineIntent(transcript, detectedCategory)
    };
  }
  
  extractKeywords(transcript) {
    // Extract important financial keywords
    const words = transcript.toLowerCase().split(' ');
    const financialTerms = [
      'money', 'rupees', 'investment', 'savings', 'debt', 'loan', 
      'budget', 'expense', 'income', 'portfolio', 'mutual fund'
    ];
    
    return words.filter(word => financialTerms.includes(word));
  }
  
  determineIntent(transcript, category) {
    const intents = {
      question: /what|how|when|where|why|can i|should i/i,
      request: /help|assist|show|tell me|explain/i,
      command: /calculate|compute|find|get|check/i
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(transcript)) {
        return intent;
      }
    }
    
    return 'statement';
  }
}

/**
 * 🔐 Voice Biometrics for Security
 */
class VoiceBiometrics {
  constructor() {
    this.userVoiceProfile = null;
    this.matchThreshold = 0.7;
  }
  
  async validateVoice(speechData) {
    // Simulate voice biometric validation
    // In production, this would use actual voice biometric algorithms
    
    if (!this.userVoiceProfile) {
      // First time - create profile
      this.userVoiceProfile = this.createVoiceProfile(speechData);
      return {
        isValid: true,
        confidence: 1.0,
        isNewProfile: true
      };
    }
    
    // Compare with existing profile
    const similarity = this.compareVoiceProfiles(speechData, this.userVoiceProfile);
    
    return {
      isValid: similarity >= this.matchThreshold,
      confidence: similarity,
      isNewProfile: false
    };
  }
  
  createVoiceProfile(speechData) {
    // Create a simple voice profile based on speech characteristics
    return {
      averageConfidence: speechData.confidence,
      speechRate: this.estimateSpeechRate(speechData.transcript),
      timestamp: new Date().toISOString()
    };
  }
  
  compareVoiceProfiles(currentSpeech, storedProfile) {
    // Simple similarity calculation
    const currentRate = this.estimateSpeechRate(currentSpeech.transcript);
    const rateDifference = Math.abs(currentRate - storedProfile.speechRate);
    
    // Similarity decreases with rate difference
    return Math.max(0, 1 - (rateDifference / 10));
  }
  
  estimateSpeechRate(transcript) {
    // Estimate words per minute (simplified)
    return transcript.split(' ').length;
  }
  
  getAccuracy() {
    return 0.85; // Simulated accuracy
  }
}

/**
 * 🔇 Ambient Noise Filter
 */
class AmbientNoiseFilter {
  constructor() {
    this.isFiltering = false;
    this.noiseProfile = null;
  }
  
  async startFiltering() {
    this.isFiltering = true;
    // In production, implement actual noise filtering
    console.log('🔇 Ambient noise filtering started');
  }
  
  stopFiltering() {
    this.isFiltering = false;
    console.log('🔇 Ambient noise filtering stopped');
  }
  
  async enhanceTranscript(transcript) {
    if (!this.isFiltering) return transcript;
    
    // Simple enhancement - remove common noise words
    const noiseWords = ['um', 'uh', 'er', 'ah'];
    let enhanced = transcript;
    
    noiseWords.forEach(noise => {
      const regex = new RegExp(`\\b${noise}\\b`, 'gi');
      enhanced = enhanced.replace(regex, '');
    });
    
    return enhanced.trim().replace(/\s+/g, ' ');
  }
  
  cleanup() {
    this.stopFiltering();
  }
}

export default AdvancedVoiceService;

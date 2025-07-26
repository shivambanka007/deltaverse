/**
 * 🌌 4D FINANCIAL EXPERIENCE INTERFACE
 * Revolutionary UI for 4-dimensional financial interactions
 * 
 * Combines:
 * - Temporal Navigation (Time Travel)
 * - Spatial Immersion (3D + Holographic)
 * - Emotional Integration (Biometric Response)
 * - Quantum Visualization (Probability Clouds)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Backdrop
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ThreeDRotation as ThreeDIcon,
  Psychology as PsychologyIcon,
  Science as QuantumIcon,
  Visibility as VisionIcon,
  Hearing as AudioIcon,
  TouchApp as HapticIcon,
  Air as AromaIcon,
  Memory as NeuroIcon,
  AutoAwesome as MagicIcon,
  Speed as SpeedIcon,
  Explore as ExploreIcon,
  Fullscreen as FullscreenIcon,
  CameraAlt as CameraIcon,
  Videocam as VideoIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import FourDimensionalFinancialEngine from '../../services/4d/FourDimensionalFinancialEngine';
import Enhanced4DVisualization from './Enhanced4DVisualization';

import { debugNavigation } from '../../utils/navigationUtils';

const FourDimensionalExperience = ({ 
  userQuery, 
  fiMcpData, 
  onExperienceComplete,
  onReturnToDashboard, // Add return callback prop
  onBackToComplex, // Add back to chat callback prop
  biometricData = {} 
}) => {
  // Debug navigation props
  React.useEffect(() => {
    debugNavigation('FourDimensionalExperience', { onReturnToDashboard, onBackToComplex });
  }, [onReturnToDashboard, onBackToComplex]);
  // 🌌 4D Engine State
  const [fourDEngine] = useState(() => new FourDimensionalFinancialEngine());
  const [currentExperience, setCurrentExperience] = useState(null);
  const [isGenerating4D, setIsGenerating4D] = useState(false);
  
  // 🕐 Temporal Controls
  const [currentTimeline, setCurrentTimeline] = useState(0);
  const [timePosition, setTimePosition] = useState(2024);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [parallelTimelines, setParallelTimelines] = useState([]);
  
  // 🌍 Spatial Controls
  const [immersionLevel, setImmersionLevel] = useState(75);
  const [spatialEnvironment, setSpatialEnvironment] = useState('financial_landscape');
  const [holographicMode, setHolographicMode] = useState(true);
  
  // 💗 Emotional Controls
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [stressLevel, setStressLevel] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(50);
  const [biometricActive, setBiometricActive] = useState(false);
  
  // ⚛️ Quantum Controls
  const [quantumVisualization, setQuantumVisualization] = useState(true);
  const [probabilityThreshold, setProbabilityThreshold] = useState(0.1);
  const [quantumStates, setQuantumStates] = useState([]);
  
  // 🎭 Sensory Controls
  const [sensorySettings, setSensorySettings] = useState({
    visual: true,
    audio: true,
    haptic: false,
    olfactory: false,
    neurological: false
  });

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  // 🌌 Initialize 4D Experience
  useEffect(() => {
    if (userQuery && fiMcpData) {
      generate4DExperience();
    }
  }, [userQuery, fiMcpData]);

  /**
   * 🚀 Generate Complete 4D Experience
   */
  const generate4DExperience = async () => {
    setIsGenerating4D(true);
    
    try {
      console.log('🌌 Generating 4D Financial Experience...');
      
      const experience = await fourDEngine.create4DExperience(
        userQuery,
        fiMcpData,
        biometricData
      );
      
      setCurrentExperience(experience);
      setParallelTimelines(experience.timeExperience.parallelRealities);
      setQuantumStates(experience.probabilityCloud.outcomeDistribution);
      
      // Initialize sensory systems
      await initializeSensorySystems(experience);
      
      console.log('✨ 4D Experience Generated:', experience);
      
    } catch (error) {
      console.error('🚨 4D Experience Generation Failed:', error);
    } finally {
      setIsGenerating4D(false);
    }
  };

  /**
   * 🎭 Initialize Sensory Systems
   */
  const initializeSensorySystems = async (experience) => {
    // Initialize audio context for spatial audio
    if (sensorySettings.audio && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Initialize haptic feedback if supported
    if (sensorySettings.haptic && navigator.vibrate) {
      console.log('🤲 Haptic feedback initialized');
    }
    
    // Initialize visual rendering
    if (canvasRef.current) {
      await initializeVisualRendering(experience);
    }
  };

  /**
   * 👁️ Initialize Visual Rendering
   */
  const initializeVisualRendering = async (experience) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Start rendering loop
    renderVisualExperience(ctx, experience);
  };

  /**
   * 🎨 Render Visual Experience
   */
  const renderVisualExperience = (ctx, experience) => {
    if (!experience) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Render quantum probability cloud
    if (quantumVisualization) {
      renderQuantumCloud(ctx, experience.probabilityCloud);
    }
    
    // Render timeline visualization
    renderTimelineVisualization(ctx, experience.timeExperience);
    
    // Render spatial environment
    renderSpatialEnvironment(ctx, experience.immersiveEnvironment);
    
    // Continue animation loop
    requestAnimationFrame(() => renderVisualExperience(ctx, experience));
  };

  /**
   * ⚛️ Render Quantum Probability Cloud
   */
  const renderQuantumCloud = (ctx, probabilityCloud) => {
    const { outcomeDistribution } = probabilityCloud;
    
    outcomeDistribution.slice(0, 100).forEach((outcome, index) => {
      const x = (index % 10) * (ctx.canvas.width / 10);
      const y = Math.floor(index / 10) * (ctx.canvas.height / 10);
      const radius = outcome.probability * 20;
      
      // Create gradient based on probability
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(100, 200, 255, ${outcome.probability})`);
      gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  /**
   * 🕐 Render Timeline Visualization
   */
  const renderTimelineVisualization = (ctx, timeExperience) => {
    const { parallelRealities } = timeExperience;
    
    parallelRealities.forEach((timeline, index) => {
      const y = 50 + (index * 30);
      const width = ctx.canvas.width - 100;
      
      // Timeline base
      ctx.strokeStyle = `hsl(${index * 30}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(50 + width, y);
      ctx.stroke();
      
      // Timeline probability indicator
      const probX = 50 + (timeline.probability * width);
      ctx.fillStyle = `hsl(${index * 30}, 70%, 50%)`;
      ctx.beginPath();
      ctx.arc(probX, y, 8, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  /**
   * 🌍 Render Spatial Environment
   */
  const renderSpatialEnvironment = (ctx, immersiveEnvironment) => {
    // Simplified 3D-like rendering
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    // Create perspective grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 10; i++) {
      const offset = i * 20;
      ctx.beginPath();
      ctx.moveTo(centerX - 200 + offset, centerY - 100);
      ctx.lineTo(centerX - 100 + offset, centerY + 100);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - 200, centerY - 100 + offset);
      ctx.lineTo(centerX + 200, centerY - 100 + offset);
      ctx.stroke();
    }
  };

  /**
   * 🕐 Handle Time Navigation
   */
  const handleTimeNavigation = (newTime) => {
    setTimePosition(newTime);
    
    // Trigger haptic feedback
    if (sensorySettings.haptic && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Update experience based on new time position
    if (currentExperience) {
      updateExperienceForTime(newTime);
    }
  };

  /**
   * 🔄 Update Experience for Time Position
   */
  const updateExperienceForTime = (newTime) => {
    console.log('🕐 Updating experience for time:', newTime);
    
    // Update timeline-specific data
    if (currentExperience && currentExperience.timeExperience) {
      const timelineData = currentExperience.timeExperience.futureSimulations.find(
        sim => sim.year === newTime
      );
      
      if (timelineData) {
        // Update confidence and stress based on timeline
        setConfidenceLevel(timelineData.confidence || 50);
        setStressLevel(timelineData.stressLevel || 0);
      }
    }
  };

  /**
   * 🌍 Handle Spatial Navigation
   */
  const handleSpatialNavigation = (environment) => {
    setSpatialEnvironment(environment);
    
    // Trigger environmental change effects
    if (currentExperience) {
      updateSpatialEnvironment(environment);
    }
  };

  /**
   * 🌍 Update Spatial Environment
   */
  const updateSpatialEnvironment = (environment) => {
    console.log('🌍 Updating spatial environment:', environment);
    
    // Update immersion level based on environment
    const environmentSettings = {
      house: { immersion: 90, stress: 0.2 },
      office: { immersion: 70, stress: 0.5 },
      market: { immersion: 85, stress: 0.8 },
      future: { immersion: 95, stress: 0.1 }
    };
    
    const settings = environmentSettings[environment] || { immersion: 75, stress: 0.3 };
    setImmersionLevel(settings.immersion);
    setStressLevel(settings.stress * 100);
  };

  /**
   * ⚛️ Handle Quantum State Collapse
   */
  const handleQuantumCollapse = (stateIndex) => {
    const selectedState = quantumStates[stateIndex];
    
    // Collapse quantum superposition to selected state
    console.log('⚛️ Collapsing quantum state:', selectedState);
    
    // Update experience based on collapsed state
    if (currentExperience) {
      updateExperienceForQuantumState(selectedState);
    }
  };

  /**
   * ⚛️ Update Experience for Quantum State
   */
  const updateExperienceForQuantumState = (selectedState) => {
    console.log('⚛️ Updating experience for quantum state:', selectedState);
    
    if (selectedState) {
      // Update confidence based on quantum state probability
      setConfidenceLevel(selectedState.probability * 100);
      
      // Update other UI elements based on quantum state
      if (selectedState.financialImpact) {
        const impact = selectedState.financialImpact;
        setStressLevel(impact < 0 ? Math.abs(impact) / 1000 : 0);
      }
    }
  };

  /**
   * 🔮 Experience Future Self
   */
  const experienceFutureSelf = async () => {
    console.log('🔮 Experiencing Future Self...');
    
    if (!currentExperience) {
      alert('Please generate 4D experience first');
      return;
    }
    
    try {
      // Get current timeline and time position
      const selectedTimeline = parallelTimelines[currentTimeline];
      const futureYear = timePosition;
      
      // Create future self experience
      const futureSelfExperience = {
        currentAge: 30 + (futureYear - 2024),
        futureYear: futureYear,
        timeline: selectedTimeline,
        netWorth: selectedTimeline?.financialMilestones?.[0]?.netWorth || 2500000,
        lifestyle: selectedTimeline?.probability > 0.7 ? 'prosperous' : 'comfortable',
        achievements: generateAchievements(selectedTimeline),
        advice: generateFutureSelfAdvice(selectedTimeline)
      };
      
      // Show future self modal/overlay
      setShowFutureSelfModal(true);
      setFutureSelfData(futureSelfExperience);
      
      // Trigger haptic feedback
      if (sensorySettings.haptic && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Update confidence based on future self interaction
      setConfidenceLevel(Math.min(confidenceLevel + 10, 100));
      
      console.log('✨ Future Self Experience Created:', futureSelfExperience);
      
    } catch (error) {
      console.error('🚨 Future Self Experience Failed:', error);
      alert('Unable to connect with your future self. Please try again.');
    }
  };

  /**
   * ⚡ Accelerate Time - Enhanced Multi-Dimensional
   */
  const accelerateTime = () => {
    console.log('⚡ Accelerating Time Across All 4D Dimensions...');
    
    if (!currentExperience) {
      alert('Please generate 4D experience first');
      return;
    }
    
    try {
      // 1. 🕐 TEMPORAL DIMENSION - Increase time speed
      const newSpeed = Math.min(timeSpeed * 2, 10); // Max 10x speed
      setTimeSpeed(newSpeed);
      
      // Animate time progression
      const startTime = timePosition;
      const endTime = Math.min(timePosition + (newSpeed * 2), 2070);
      animateTimeProgression(startTime, endTime, newSpeed);
      
      // 2. 🌍 SPATIAL DIMENSION - Accelerate environment changes
      accelerateSpatialDimension(newSpeed);
      
      // 3. 💗 EMOTIONAL DIMENSION - Update emotional state
      accelerateEmotionalDimension(newSpeed);
      
      // 4. ⚛️ QUANTUM DIMENSION - Speed up probability calculations
      accelerateQuantumDimension(newSpeed);
      
      // 5. 🎭 MULTI-SENSORY - Enhance all sensory feedback
      accelerateSensoryExperience(newSpeed);
      
      // Update all UI elements
      updateAllDimensionsForAcceleration(newSpeed);
      
      console.log(`⚡ All 4D dimensions accelerated to ${newSpeed}x speed`);
      
    } catch (error) {
      console.error('🚨 4D Time Acceleration Failed:', error);
      alert('4D time acceleration malfunction. Please try again.');
    }
  };

  /**
   * 🌍 Accelerate Spatial Dimension
   */
  const accelerateSpatialDimension = (speed) => {
    // Increase immersion level with speed
    const newImmersion = Math.min(immersionLevel + (speed * 5), 100);
    setImmersionLevel(newImmersion);
    
    // Cycle through environments rapidly
    const environments = ['house', 'office', 'market', 'future'];
    const envIndex = Math.floor(Date.now() / (1000 / speed)) % environments.length;
    setSpatialEnvironment(environments[envIndex]);
    
    console.log(`🌍 Spatial dimension accelerated: ${newImmersion}% immersion, environment: ${environments[envIndex]}`);
  };

  /**
   * 💗 Accelerate Emotional Dimension
   */
  const accelerateEmotionalDimension = (speed) => {
    // Reduce stress as user sees rapid progress
    const stressReduction = speed * 5;
    setStressLevel(Math.max(0, stressLevel - stressReduction));
    
    // Increase confidence with acceleration
    const confidenceBoost = speed * 8;
    setConfidenceLevel(Math.min(100, confidenceLevel + confidenceBoost));
    
    // Update emotional state
    if (speed >= 8) {
      setEmotionalState('excited');
    } else if (speed >= 4) {
      setEmotionalState('confident');
    } else {
      setEmotionalState('optimistic');
    }
    
    console.log(`💗 Emotional dimension accelerated: stress ${stressLevel}%, confidence ${confidenceLevel}%`);
  };

  /**
   * ⚛️ Accelerate Quantum Dimension
   */
  const accelerateQuantumDimension = (speed) => {
    // Increase probability threshold with speed
    const newThreshold = Math.min(probabilityThreshold + (speed * 0.05), 0.9);
    setProbabilityThreshold(newThreshold);
    
    // Enable quantum visualization at high speeds
    if (speed >= 4) {
      setQuantumVisualization(true);
    }
    
    // Simulate quantum state changes
    if (quantumStates.length > 0) {
      const activeStates = Math.min(quantumStates.length, speed * 2);
      console.log(`⚛️ Quantum dimension accelerated: ${activeStates} active states, threshold ${newThreshold}`);
    }
  };

  /**
   * 🎭 Accelerate Sensory Experience
   */
  const accelerateSensoryExperience = (speed) => {
    // Enable more sensory systems at higher speeds
    if (speed >= 4) {
      setSensorySettings(prev => ({
        ...prev,
        haptic: true,
        audio: true
      }));
    }
    
    if (speed >= 8) {
      setSensorySettings(prev => ({
        ...prev,
        olfactory: true,
        neurological: true
      }));
    }
    
    // Enhanced haptic feedback pattern
    if (sensorySettings.haptic && navigator.vibrate) {
      const pattern = [];
      for (let i = 0; i < speed; i++) {
        pattern.push(100, 50); // Vibrate, pause
      }
      navigator.vibrate(pattern);
    }
    
    console.log(`🎭 Sensory experience accelerated: ${Object.values(sensorySettings).filter(Boolean).length}/5 senses active`);
  };

  /**
   * 🔄 Update All Dimensions for Acceleration
   */
  const updateAllDimensionsForAcceleration = (speed) => {
    // Update timeline selection to show most probable outcome
    if (parallelTimelines.length > 0) {
      const bestTimeline = parallelTimelines.reduce((best, current, index) => 
        current.probability > best.probability ? { ...current, index } : best, 
        { probability: 0, index: 0 }
      );
      setCurrentTimeline(bestTimeline.index);
    }
    
    // Visual acceleration effects on canvas
    triggerTimeAccelerationEffects(speed);
    
    // Update financial projections
    updateFinancialProjections(speed);
  };

  /**
   * 🎭 Generate Achievements
   */
  const generateAchievements = (timeline) => {
    const achievements = [];
    
    if (timeline?.probability > 0.8) {
      achievements.push('🏆 Achieved Financial Independence');
      achievements.push('🏠 Owned Multiple Properties');
      achievements.push('✈️ Traveled to 25+ Countries');
    } else if (timeline?.probability > 0.6) {
      achievements.push('💰 Built Substantial Wealth');
      achievements.push('🏡 Owned Dream Home');
      achievements.push('🎓 Funded Children\'s Education');
    } else {
      achievements.push('💪 Maintained Financial Stability');
      achievements.push('🛡️ Built Emergency Fund');
      achievements.push('📈 Consistent Investment Growth');
    }
    
    return achievements;
  };

  /**
   * 💬 Generate Future Self Advice
   */
  const generateFutureSelfAdvice = (timeline) => {
    const advice = [];
    
    if (timeline?.probability > 0.7) {
      advice.push("The key was starting early and staying consistent with investments.");
      advice.push("Don't let market volatility scare you - time in market beats timing the market.");
      advice.push("That house you're considering? It was one of our best decisions.");
    } else {
      advice.push("I wish we had been more aggressive with our investments when we were young.");
      advice.push("Focus on increasing your income and reducing unnecessary expenses.");
      advice.push("Build that emergency fund first - it saved us multiple times.");
    }
    
    return advice;
  };

  /**
   * 🎬 Animate Time Progression
   */
  const animateTimeProgression = (startTime, endTime, speed) => {
    const duration = 2000; // 2 seconds animation
    const steps = 20;
    const stepDuration = duration / steps;
    const timeStep = (endTime - startTime) / steps;
    
    let currentStep = 0;
    
    const animationInterval = setInterval(() => {
      currentStep++;
      const newTime = startTime + (timeStep * currentStep);
      setTimePosition(Math.round(newTime));
      
      // Update stress and confidence during animation
      setStressLevel(Math.max(0, stressLevel - (currentStep * 2)));
      
      if (currentStep >= steps) {
        clearInterval(animationInterval);
        console.log(`⏰ Time progression complete: ${endTime}`);
      }
    }, stepDuration);
  };

  /**
   * 📊 Update Financial Projections
   */
  const updateFinancialProjections = (speed) => {
    // Simulate rapid financial growth visualization
    const growthRate = 0.12; // 12% annual growth
    const years = speed * 2;
    const currentValue = 500000; // Base portfolio value
    
    const projectedValue = currentValue * Math.pow(1 + growthRate, years);
    
    // Update confidence based on projections
    setConfidenceLevel(Math.min(75 + (speed * 5), 100));
    
    console.log(`📈 Projected value after ${years} years: ₹${projectedValue.toLocaleString()}`);
  };

  /**
   * ✨ Trigger Time Acceleration Effects
   */
  const triggerTimeAccelerationEffects = (speed) => {
    // Visual effects for time acceleration
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      
      // Create time warp effect
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = `hsl(${speed * 30}, 70%, 50%)`;
      
      // Draw acceleration rings
      for (let i = 0; i < speed; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50 + (i * 30), 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Update quantum visualization
    setQuantumVisualization(true);
  };

  // Add state for future self modal
  const [showFutureSelfModal, setShowFutureSelfModal] = useState(false);
  const [futureSelfData, setFutureSelfData] = useState(null);
  
  // 🎨 Enhanced Visualization State
  const [enhancedMode, setEnhancedMode] = useState(false);
  const [visualQuality, setVisualQuality] = useState('high'); // low, medium, high, ultra

  /**
   * 🎭 Toggle Sensory System
   */
  const toggleSensorySystem = (system) => {
    setSensorySettings(prev => ({
      ...prev,
      [system]: !prev[system]
    }));
    
    console.log(`🎭 ${system} sensory system ${sensorySettings[system] ? 'disabled' : 'enabled'}`);
  };

  if (isGenerating4D) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={80} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          🌌 Generating 4D Financial Experience...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyzing temporal dimensions, spatial environments, emotional states, and quantum probabilities...
        </Typography>
      </Box>
    );
  }

  if (!currentExperience) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        🌌 4D Financial Experience ready to generate. Provide a financial query to begin.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Return to Dashboard Button - Top Right */}
      {onReturnToDashboard && (
        <Fab
          color="primary"
          onClick={() => {
            console.log('[FourDimensionalExperience] Return to Dashboard clicked');
            console.log('[FourDimensionalExperience] onReturnToDashboard type:', typeof onReturnToDashboard);
            if (onReturnToDashboard) {
              onReturnToDashboard();
            } else {
              console.error('[FourDimensionalExperience] onReturnToDashboard is not provided!');
            }
          }}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            bgcolor: '#667eea',
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              bgcolor: '#5a67d8',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)'
            }
          }}
        >
          <Tooltip title="Return to Dashboard">
            <CloseIcon />
          </Tooltip>
        </Fab>
      )}

      {/* Back to Chat Button - Top Right (below dashboard button) */}
      {onBackToComplex && (
        <Fab
          size="small"
          onClick={onBackToComplex}
          sx={{
            position: 'absolute',
            top: 80,
            right: 20,
            zIndex: 1000,
            bgcolor: '#4CAF50',
            color: 'white',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
            '&:hover': {
              bgcolor: '#45a049',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(76, 175, 80, 0.5)'
            }
          }}
        >
          <Tooltip title="Back to Chat">
            <span>←</span>
          </Tooltip>
        </Fab>
      )}

      {/* 🌌 Enhanced 4D Visualization or Basic Canvas */}
      {enhancedMode ? (
        <Enhanced4DVisualization
          currentExperience={currentExperience}
          onExperienceUpdate={setCurrentExperience}
          fiMcpData={biometricData}
        />
      ) : (
        <>
          {/* 🌌 Basic 4D Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
            }}
          />

          {/* 🎨 Enhanced Mode Toggle */}
          <Fab
            size="small"
            onClick={() => setEnhancedMode(true)}
            sx={{
              position: 'absolute',
              top: 20,
              right: 80,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { transform: 'scale(1.1)' },
              zIndex: 1001
            }}
          >
            <Tooltip title="🎨 Enable Master Graphics Mode">
              <CameraIcon />
            </Tooltip>
          </Fab>
        </>
      )}

      {/* 🔙 Back to Basic Mode Button (when in enhanced mode) */}
      {enhancedMode && (
        <Fab
          size="small"
          onClick={() => setEnhancedMode(false)}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            zIndex: 1002,
            '&:hover': { background: 'rgba(0, 0, 0, 0.9)' }
          }}
        >
          <Tooltip title="🔙 Back to Basic Mode">
            <CloseIcon />
          </Tooltip>
        </Fab>
      )}

      {/* 🕐 Temporal Controls - Only in Basic Mode */}
      {!enhancedMode && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            p: 2,
            minWidth: 300,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TimelineIcon />
          Temporal Navigation
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" gutterBottom>
            Time Position: {timePosition}
          </Typography>
          <Slider
            value={timePosition}
            min={2024}
            max={2070}
            onChange={(_, value) => handleTimeNavigation(value)}
            sx={{ color: '#00bcd4' }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" gutterBottom>
            Timeline: {currentTimeline + 1} of {parallelTimelines.length}
          </Typography>
          <Slider
            value={currentTimeline}
            min={0}
            max={Math.max(0, parallelTimelines.length - 1)}
            onChange={(_, value) => setCurrentTimeline(value)}
            sx={{ color: '#4caf50' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => setTimeSpeed(0.5)}>0.5x</Button>
          <Button size="small" onClick={() => setTimeSpeed(1)}>1x</Button>
          <Button size="small" onClick={() => setTimeSpeed(2)}>2x</Button>
          <Button size="small" onClick={() => setTimeSpeed(5)}>5x</Button>
        </Box>
        </Paper>
      )}

      {/* 🌍 Spatial Controls - Only in Basic Mode */}
      {!enhancedMode && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            p: 2,
            minWidth: 300,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ThreeDIcon />
          Spatial Environment
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" gutterBottom>
            Immersion Level: {immersionLevel}%
          </Typography>
          <Slider
            value={immersionLevel}
            min={0}
            max={100}
            onChange={(_, value) => setImmersionLevel(value)}
            sx={{ color: '#ff9800' }}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={holographicMode}
              onChange={(e) => setHolographicMode(e.target.checked)}
            />
          }
          label="Holographic Mode"
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {['house', 'office', 'market', 'future'].map((env) => (
            <Chip
              key={env}
              label={env}
              onClick={() => handleSpatialNavigation(env)}
              color={spatialEnvironment === env ? 'primary' : 'default'}
              size="small"
            />
          ))}
        </Box>
        </Paper>
      )}

      {/* ⚛️ Quantum Controls - Only in Basic Mode */}
      {!enhancedMode && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            p: 2,
            minWidth: 350,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <QuantumIcon />
          Quantum Probability States
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" gutterBottom>
            Probability Threshold: {probabilityThreshold}
          </Typography>
          <Slider
            value={probabilityThreshold}
            min={0}
            max={1}
            step={0.01}
            onChange={(_, value) => setProbabilityThreshold(value)}
            sx={{ color: '#e91e63' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quantumStates.slice(0, 5).map((state, index) => (
            <Button
              key={index}
              size="small"
              variant="outlined"
              onClick={() => handleQuantumCollapse(index)}
              sx={{ 
                opacity: state.probability,
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                color: `hsl(${index * 60}, 70%, 50%)`
              }}
            >
              State {index + 1}
            </Button>
          ))}
        </Box>
        </Paper>
      )}

      {/* 🎭 Sensory Controls - Only in Basic Mode */}
      {!enhancedMode && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            p: 2,
          minWidth: 300,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MagicIcon />
          Sensory Integration
        </Typography>
        
        <Grid container spacing={1}>
          {[
            { key: 'visual', icon: VisionIcon, label: 'Visual' },
            { key: 'audio', icon: AudioIcon, label: 'Audio' },
            { key: 'haptic', icon: HapticIcon, label: 'Haptic' },
            { key: 'olfactory', icon: AromaIcon, label: 'Aroma' },
            { key: 'neurological', icon: NeuroIcon, label: 'Neural' }
          ].map(({ key, icon: Icon, label }) => (
            <Grid item size={6} key={key}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sensorySettings[key]}
                    onChange={() => toggleSensorySystem(key)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon fontSize="small" />
                    {label}
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>
        </Paper>
      )}

      {/* 🚀 Action Buttons - Only in Basic Mode */}
      {!enhancedMode && (
        <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 2
        }}
      >
        <Tooltip title="Experience Future Self">
          <Fab
            color="primary"
            onClick={experienceFutureSelf}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <ExploreIcon />
          </Fab>
        </Tooltip>
        
        <Tooltip title="Accelerate Time">
          <Fab
            color="secondary"
            onClick={accelerateTime}
            sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <SpeedIcon />
          </Fab>
        </Tooltip>
      </Box>
      )}

      {/* 📊 Experience Stats - Only in Basic Mode */}
      {!enhancedMode && currentExperience && (
        <Card
          sx={{
            position: 'absolute',
            top: '50%',
            right: 20,
            transform: 'translateY(-50%)',
            minWidth: 200,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              4D Experience Stats
            </Typography>
            <Typography variant="body2">
              Confidence: {confidenceLevel}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={confidenceLevel} 
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">
              Stress Level: {stressLevel}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={stressLevel} 
              color="error"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">
              Quantum Coherence: {Math.round(quantumStates.length * probabilityThreshold)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={quantumStates.length * probabilityThreshold * 10} 
              color="secondary"
            />
          </CardContent>
        </Card>
      )}

      {/* 🔮 Future Self Experience Modal */}
      <Dialog
        open={showFutureSelfModal}
        onClose={() => setShowFutureSelfModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
          >
            <ExploreIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            🔮 Meeting Your Future Self
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {futureSelfData && `You in ${futureSelfData.futureYear} (Age ${futureSelfData.currentAge})`}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {futureSelfData && (
            <Box>
              {/* Financial Status */}
              <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💰 Your Financial Status in {futureSelfData.futureYear}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Net Worth:</strong> ₹{futureSelfData.netWorth.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Lifestyle:</strong> {futureSelfData.lifestyle}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Timeline Probability: {Math.round((parallelTimelines[currentTimeline]?.probability || 0.7) * 100)}%
                  </Typography>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏆 Your Achievements
                  </Typography>
                  {futureSelfData.achievements.map((achievement, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {achievement}
                    </Typography>
                  ))}
                </CardContent>
              </Card>

              {/* Future Self Advice */}
              <Card sx={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💬 Message from Your Future Self
                  </Typography>
                  {futureSelfData.advice.map((message, index) => (
                    <Typography key={index} variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{message}"
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setShowFutureSelfModal(false)}
            sx={{ 
              background: 'rgba(255,255,255,0.2)',
              '&:hover': { background: 'rgba(255,255,255,0.3)' }
            }}
          >
            Return to Present
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FourDimensionalExperience;

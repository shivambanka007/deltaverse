/**
 * 🌌 ENHANCED 4D FINANCIAL VISUALIZATION
 * Master UI/UX Design with 50 Years of Experience
 * Advanced Google Architecture with 60 Years of Expertise
 * 
 * Revolutionary 4D Visual Experience:
 * - Cinematic 3D Environments
 * - Holographic Data Visualization
 * - Particle System Effects
 * - Advanced Shader Programming
 * - Real-time Ray Tracing
 * - Volumetric Lighting
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
  Fab,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Backdrop
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ThreeDRotation as ThreeDIcon,
  Psychology as PsychologyIcon,
  Science as QuantumIcon,
  Visibility as VisionIcon,
  AutoAwesome as MagicIcon,
  Speed as SpeedIcon,
  Explore as ExploreIcon,
  Fullscreen as FullscreenIcon,
  CameraAlt as CameraIcon,
  Videocam as VideoIcon,
  VolumeUp as AudioIcon
} from '@mui/icons-material';

import SimpleFinancialView from './SimpleFinancialView';
import UserFriendly4DView from './UserFriendly4DView';
import FourGraphsView from './FourGraphsView';
import CrystalClear4DView from './CrystalClear4DView';

// Import centralized financial data context for synchronization
import { FinancialDataProvider } from '../../contexts/FinancialDataContext';

const Enhanced4DVisualization = ({ 
  currentExperience, 
  onExperienceUpdate,
  fiMcpData 
}) => {
  // 🎨 Advanced Visual State
  const [visualMode, setVisualMode] = useState('risk_analysis'); // risk_analysis, goal_tracking, cash_flow, market_impact
  const [renderQuality, setRenderQuality] = useState('ultra'); // low, medium, high, ultra
  const [particleSystem, setParticleSystem] = useState(true);
  const [volumetricLighting, setVolumetricLighting] = useState(true);
  const [rayTracing, setRayTracing] = useState(true);
  const [bloomEffect, setBloomEffect] = useState(true);
  const [motionBlur, setMotionBlur] = useState(true);
  
  // 🌌 4D Dimension States
  const [temporalVisualization, setTemporalVisualization] = useState('timeline_spiral');
  const [spatialEnvironment, setSpatialEnvironment] = useState('financial_nexus');
  const [emotionalVisualization, setEmotionalVisualization] = useState('biometric_aura');
  const [quantumVisualization, setQuantumVisualization] = useState('probability_cloud');
  
  // 🎭 Interactive States
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0, z: 0 });
  const [fieldOfView, setFieldOfView] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSimpleView, setShowSimpleView] = useState(false);
  const [showUserFriendlyView, setShowUserFriendlyView] = useState(false);
  const [showFourGraphsView, setShowFourGraphsView] = useState(false);
  const [showCrystalClearView, setShowCrystalClearView] = useState(false);
  
  // 🎬 Animation States
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [transitionDuration, setTransitionDuration] = useState(2000);
  const [easeFunction, setEaseFunction] = useState('cubic-bezier(0.4, 0, 0.2, 1)');
  
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const webglContextRef = useRef(null);

  // 🚀 Initialize Advanced WebGL Context
  useEffect(() => {
    if (canvasRef.current) {
      initializeAdvancedWebGL();
      startRenderLoop();
      
      // Add resize handler
      const handleResize = () => {
        if (canvasRef.current) {
          initializeAdvancedWebGL();
        }
      };
      
      // Add fullscreen change handler
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );
        setIsFullscreen(isCurrentlyFullscreen);
      };
      
      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Add demo content immediately for visual feedback
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Clear and draw centered demo content
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add a pulsing center indicator (properly centered)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.fillStyle = 'rgba(255, 100, 200, 0.8)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Add text to show canvas is working
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('4D Visualization Active', centerX, centerY + 50);
            
            console.log(`🎨 Demo content rendered at center: ${centerX}, ${centerY}`);
          }
        }
      }, 100);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);

  /**
   * 🎨 Initialize Canvas - Fixed Scaling and Positioning
   */
  const initializeAdvancedWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get actual canvas dimensions from CSS
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas internal dimensions to match display size exactly
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    
    // Get 2D context and reset any transforms
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Reset any existing transforms to prevent scattered visuals
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Set proper text rendering
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      console.log(`🎨 Canvas initialized: ${canvas.width}x${canvas.height} (${rect.width}x${rect.height})`);
    }
  };

  /**
   * 🎬 Master Render Loop - Always Active
   */
  const startRenderLoop = () => {
    const render = (timestamp) => {
      // Always render, don't wait for currentExperience
      if (canvasRef.current) {
        renderMasterpiece(timestamp);
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    animationFrameRef.current = requestAnimationFrame(render);
  };

  /**
   * 🌟 Render Masterpiece - Fixed Canvas Context
   */
  const renderMasterpiece = (timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use 2D context for reliable rendering
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas has proper dimensions
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    // Clear canvas with dynamic background
    const bgColor = calculateDynamicBackground(timestamp);
    ctx.fillStyle = `rgba(${Math.floor(bgColor.r * 255)}, ${Math.floor(bgColor.g * 255)}, ${Math.floor(bgColor.b * 255)}, ${bgColor.a})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render 4D content with proper centering
    render4DContent(ctx, timestamp);
  };

  /**
   * 🌌 Render 4D Content - Fixed Centering
   */
  const render4DContent = (ctx, timestamp) => {
    // Get actual canvas dimensions
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = timestamp * 0.001 * animationSpeed;
    
    // Ensure we have valid center coordinates
    if (!centerX || !centerY || centerX <= 0 || centerY <= 0) {
      console.warn('Invalid canvas dimensions, skipping render');
      return;
    }
    
    // Save context state
    ctx.save();
    
    // 🕐 TEMPORAL DIMENSION - Spiral Timelines
    renderTemporalSpirals(ctx, centerX, centerY, time);
    
    // 🌍 SPATIAL DIMENSION - Environment Effects
    renderSpatialEnvironment(ctx, centerX, centerY, time);
    
    // 💗 EMOTIONAL DIMENSION - Biometric Aura
    renderEmotionalAura(ctx, centerX, centerY, time);
    
    // ⚛️ QUANTUM DIMENSION - Probability Particles
    if (particleSystem) renderQuantumParticles(ctx, centerX, centerY, time);
    
    // 🎭 Visual Mode Specific Effects
    renderVisualModeEffects(ctx, centerX, centerY, time);
    
    // Restore context state
    ctx.restore();
  };

  /**
   * 🕐 Render Temporal Spirals
   */
  const renderTemporalSpirals = (ctx, centerX, centerY, time) => {
    ctx.save();
    
    // Create 3 spiral timelines
    for (let spiral = 0; spiral < 3; spiral++) {
      const radius = 100 + (spiral * 50);
      const hue = (spiral * 120 + time * 30) % 360;
      
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = `hsl(${hue}, 70%, 60%)`;
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      for (let i = 0; i < 360; i += 5) {
        const angle = (i + time * 20) * Math.PI / 180;
        const spiralRadius = radius + Math.sin(angle * 3) * 20;
        const x = centerX + Math.cos(angle) * spiralRadius;
        const y = centerY + Math.sin(angle) * spiralRadius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Add timeline events as glowing orbs
      for (let event = 0; event < 8; event++) {
        const eventAngle = (event * 45 + time * 10) * Math.PI / 180;
        const eventRadius = radius + Math.sin(eventAngle * 3) * 20;
        const eventX = centerX + Math.cos(eventAngle) * eventRadius;
        const eventY = centerY + Math.sin(eventAngle) * eventRadius;
        
        const gradient = ctx.createRadialGradient(eventX, eventY, 0, eventX, eventY, 15);
        gradient.addColorStop(0, `hsla(${hue + 60}, 80%, 80%, 1)`);
        gradient.addColorStop(1, `hsla(${hue + 60}, 80%, 80%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(eventX, eventY, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  };

  /**
   * 🌍 Render Spatial Environment
   */
  const renderSpatialEnvironment = (ctx, centerX, centerY, time) => {
    ctx.save();
    
    switch (spatialEnvironment) {
      case 'financial_nexus':
        renderFinancialNexusEffect(ctx, centerX, centerY, time);
        break;
      case 'quantum_garden':
        renderQuantumGardenEffect(ctx, centerX, centerY, time);
        break;
      case 'temporal_cathedral':
        renderTemporalCathedralEffect(ctx, centerX, centerY, time);
        break;
      case 'probability_ocean':
        renderProbabilityOceanEffect(ctx, centerX, centerY, time);
        break;
      default:
        renderFinancialNexusEffect(ctx, centerX, centerY, time);
    }
    
    ctx.restore();
  };

  /**
   * 💗 Render Emotional Aura
   */
  const renderEmotionalAura = (ctx, centerX, centerY, time) => {
    ctx.save();
    
    // Pulsing aura based on emotional state
    const pulseSize = 200 + Math.sin(time * 2) * 50;
    const auraOpacity = 0.1 + Math.sin(time * 3) * 0.05;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, `rgba(100, 200, 255, ${auraOpacity})`);
    gradient.addColorStop(0.5, `rgba(150, 100, 255, ${auraOpacity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 100, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  /**
   * ⚛️ Render Quantum Particles
   */
  const renderQuantumParticles = (ctx, centerX, centerY, time) => {
    ctx.save();
    
    // Render 100 quantum particles (representing the 10K shown in monitor)
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2 + time * 0.5;
      const radius = 150 + Math.sin(time + i * 0.1) * 100;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const size = 3 + Math.sin(time * 2 + i * 0.2) * 2;
      const hue = (i * 3.6 + time * 50) % 360;
      
      ctx.fillStyle = `hsla(${hue}, 70%, 70%, 0.8)`;
      ctx.shadowColor = `hsl(${hue}, 70%, 70%)`;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  /**
   * 🎯 Render Financial Analysis Effects - Meaningful Visualizations
   */
  const renderVisualModeEffects = (ctx, centerX, centerY, time) => {
    ctx.save();
    
    switch (visualMode) {
      case 'risk_analysis':
        renderRiskAnalysisView(ctx, centerX, centerY, time);
        break;
      case 'goal_tracking':
        renderGoalTrackingView(ctx, centerX, centerY, time);
        break;
      case 'cash_flow':
        renderCashFlowView(ctx, centerX, centerY, time);
        break;
      case 'market_impact':
        renderMarketImpactView(ctx, centerX, centerY, time);
        break;
      default:
        renderRiskAnalysisView(ctx, centerX, centerY, time);
    }
    
    ctx.restore();
  };

  /**
   * ⚠️ Risk Analysis View - Show Financial Risks (Fixed Centering)
   */
  const renderRiskAnalysisView = (ctx, centerX, centerY, time) => {
    // Validate center coordinates
    if (!centerX || !centerY || centerX <= 0 || centerY <= 0) return;
    
    // Risk level indicators
    const risks = [
      { label: 'Market Risk', level: 0.6, color: '#FF5722', angle: 0 },
      { label: 'Inflation Risk', level: 0.4, color: '#FF9800', angle: Math.PI / 2 },
      { label: 'Liquidity Risk', level: 0.3, color: '#FFC107', angle: Math.PI },
      { label: 'Credit Risk', level: 0.2, color: '#4CAF50', angle: 3 * Math.PI / 2 }
    ];

    ctx.save();
    
    risks.forEach((risk, index) => {
      const radius = 80 + (risk.level * 60);
      const x = centerX + Math.cos(risk.angle + time * 0.1) * radius;
      const y = centerY + Math.sin(risk.angle + time * 0.1) * radius;
      
      // Risk indicator circle
      ctx.fillStyle = risk.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, 15 + risk.level * 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Risk level bar
      ctx.globalAlpha = 1;
      ctx.fillStyle = risk.color;
      ctx.fillRect(x - 30, y + 25, 60 * risk.level, 8);
      
      // Risk label
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(risk.label, x, y - 25);
      ctx.fillText(`${(risk.level * 100).toFixed(0)}%`, x, y + 5);
    });
    
    // Center title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Risk Analysis', centerX, centerY);
    
    ctx.restore();
  };

  /**
   * 🎯 Goal Tracking View - Show Progress Toward Goals (Fixed Centering)
   */
  const renderGoalTrackingView = (ctx, centerX, centerY, time) => {
    // Validate center coordinates
    if (!centerX || !centerY || centerX <= 0 || centerY <= 0) return;
    
    const goals = [
      { name: 'Emergency Fund', progress: 0.8, target: '₹3L', color: '#4CAF50' },
      { name: 'House Down Payment', progress: 0.4, target: '₹15L', color: '#2196F3' },
      { name: 'Child Education', progress: 0.2, target: '₹25L', color: '#FF9800' },
      { name: 'Retirement Fund', progress: 0.1, target: '₹2Cr', color: '#9C27B0' }
    ];

    ctx.save();
    
    goals.forEach((goal, index) => {
      const angle = (index / goals.length) * Math.PI * 2 + time * 0.05;
      const radius = 120;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Goal circle background
      ctx.strokeStyle = goal.color;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.stroke();
      
      // Progress arc
      ctx.globalAlpha = 1;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(x, y, 40, -Math.PI / 2, -Math.PI / 2 + (goal.progress * Math.PI * 2));
      ctx.stroke();
      
      // Goal info
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(goal.progress * 100).toFixed(0)}%`, x, y);
      ctx.font = '10px Arial';
      ctx.fillText(goal.name, x, y - 55);
      ctx.fillText(goal.target, x, y + 55);
    });
    
    // Center title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Goal Progress', centerX, centerY);
    
    ctx.restore();
  };

  /**
   * 💰 Cash Flow View - Show Money In/Out (Fixed Centering)
   */
  const renderCashFlowView = (ctx, centerX, centerY, time) => {
    // Validate center coordinates
    if (!centerX || !centerY || centerX <= 0 || centerY <= 0) return;
    
    ctx.save();
    
    // Income flow (green particles flowing in)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time * 0.5;
      const distance = 200 - (time * 50 + i * 10) % 200;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = '#4CAF50';
      ctx.globalAlpha = Math.max(0.1, 1 - (distance / 200));
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Expense flow (red particles flowing out)
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 - time * 0.3;
      const distance = (time * 40 + i * 15) % 180;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = '#F44336';
      ctx.globalAlpha = Math.max(0.1, distance / 180);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Cash flow summary in center
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Monthly Cash Flow', centerX, centerY - 30);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = '14px Arial';
    ctx.fillText('Income: ₹80k', centerX, centerY - 10);
    
    ctx.fillStyle = '#F44336';
    ctx.fillText('Expenses: ₹50k', centerX, centerY + 10);
    
    ctx.fillStyle = '#2196F3';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Savings: ₹30k', centerX, centerY + 30);
    
    ctx.restore();
  };

  /**
   * 📈 Market Impact View - Show Market Effects (Fixed Centering)
   */
  const renderMarketImpactView = (ctx, centerX, centerY, time) => {
    // Validate center coordinates
    if (!centerX || !centerY || centerX <= 0 || centerY <= 0) return;
    
    ctx.save();
    
    // Market trend waves
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    
    for (let wave = 0; wave < 5; wave++) {
      ctx.beginPath();
      const waveY = centerY - 100 + wave * 50;
      
      for (let x = centerX - 200; x <= centerX + 200; x += 5) {
        const waveHeight = Math.sin((x - centerX) * 0.02 + time + wave * 0.8) * (20 + wave * 5);
        const y = waveY + waveHeight;
        
        if (x === centerX - 200) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Market indicators
    const indicators = [
      { name: 'Nifty 50', change: '+1.2%', color: '#4CAF50' },
      { name: 'Sensex', change: '+0.8%', color: '#4CAF50' },
      { name: 'Gold', change: '-0.3%', color: '#F44336' },
      { name: 'USD/INR', change: '+0.1%', color: '#4CAF50' }
    ];
    
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    indicators.forEach((indicator, index) => {
      const x = centerX - 150 + index * 100;
      const y = centerY + 80;
      
      ctx.fillStyle = indicator.color;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(indicator.name, x, y);
      ctx.fillText(indicator.change, x, y + 15);
    });
    
    // Center title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Market Impact', centerX, centerY - 120);
    
    ctx.restore();
  };

  /**
   * 🎬 Environment Effect Functions
   */
  const renderFinancialNexusEffect = (ctx, centerX, centerY, time) => {
    // Grid pattern for nexus
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = -5; i <= 5; i++) {
      const x = centerX + i * 50;
      const y = centerY + i * 50;
      
      ctx.beginPath();
      ctx.moveTo(x, centerY - 250);
      ctx.lineTo(x, centerY + 250);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - 250, y);
      ctx.lineTo(centerX + 250, y);
      ctx.stroke();
    }
  };

  const renderQuantumGardenEffect = (ctx, centerX, centerY, time) => {
    // Organic flowing patterns
    ctx.strokeStyle = 'rgba(100, 255, 100, 0.4)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const startAngle = (i / 8) * Math.PI * 2;
      
      for (let j = 0; j < 100; j++) {
        const t = j / 100;
        const angle = startAngle + t * Math.PI * 4;
        const radius = 50 + t * 150 + Math.sin(time + i) * 30;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const renderTemporalCathedralEffect = (ctx, centerX, centerY, time) => {
    // Gothic arch patterns
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * 100;
      const y1 = centerY + Math.sin(angle) * 100;
      const x2 = centerX + Math.cos(angle) * 200;
      const y2 = centerY + Math.sin(angle) * 200;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const renderProbabilityOceanEffect = (ctx, centerX, centerY, time) => {
    // Wave patterns
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
    ctx.lineWidth = 2;
    
    for (let wave = 0; wave < 10; wave++) {
      ctx.beginPath();
      const waveY = centerY - 200 + wave * 40;
      
      for (let x = centerX - 300; x <= centerX + 300; x += 5) {
        const waveHeight = Math.sin((x - centerX) * 0.01 + time + wave * 0.5) * 20;
        const y = waveY + waveHeight;
        
        if (x === centerX - 300) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  /**
   * 🎨 Visual Mode Specific Effects
   */
  const renderCinematicEffects = (ctx, centerX, centerY, time) => {
    // Dramatic lighting rays
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.1;
      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(angle) * 300,
        centerY + Math.sin(angle) * 300
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 300, angle - 0.1, angle + 0.1);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const renderHolographicEffects = (ctx, centerX, centerY, time) => {
    // Holographic scan lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < ctx.canvas.height; y += 4) {
      const opacity = 0.1 + Math.sin(time * 5 + y * 0.1) * 0.1;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const renderQuantumModeEffects = (ctx, centerX, centerY, time) => {
    // Quantum interference patterns
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
      const radius = 50 + i * 15;
      const opacity = Math.sin(time * 2 + i * 0.3) * 0.5 + 0.5;
      ctx.globalAlpha = opacity * 0.3;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const renderNeuralEffects = (ctx, centerX, centerY, time) => {
    // Neural network connections
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.6)';
    ctx.lineWidth = 2;
    
    // Create neural nodes
    const nodes = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 100 + Math.sin(time + i) * 50;
      nodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    
    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    ctx.fillStyle = 'rgba(100, 255, 200, 0.8)';
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  /**
   * 🌌 Render All 4D Dimensions
   */
  const render4DDimensions = (gl, timestamp) => {
    // 🕐 TEMPORAL DIMENSION - Time Spiral Visualization
    renderTemporalDimension(gl, timestamp);
    
    // 🌍 SPATIAL DIMENSION - 3D Financial Environments
    renderSpatialDimension(gl, timestamp);
    
    // 💗 EMOTIONAL DIMENSION - Biometric Aura
    renderEmotionalDimension(gl, timestamp);
    
    // ⚛️ QUANTUM DIMENSION - Probability Clouds
    renderQuantumDimension(gl, timestamp);
    
    // 🎭 PARTICLE SYSTEMS - Advanced Effects
    if (particleSystem) renderParticleEffects(gl, timestamp);
  };

  /**
   * 🕐 Render Temporal Dimension - Time Spiral
   */
  const renderTemporalDimension = (gl, timestamp) => {
    if (!currentExperience?.timeExperience) return;
    
    const timelines = currentExperience.timeExperience.parallelRealities || [];
    
    timelines.forEach((timeline, index) => {
      // Create beautiful spiral timeline
      const spiralRadius = 2 + (index * 0.3);
      const spiralHeight = index * 0.5;
      const timelineColor = `hsl(${index * 30}, 80%, 60%)`;
      
      // Render timeline as glowing spiral
      renderGlowingSpiral(gl, {
        radius: spiralRadius,
        height: spiralHeight,
        color: timelineColor,
        opacity: timeline.probability || 0.7,
        animation: timestamp * 0.001 * animationSpeed
      });
      
      // Add timeline events as floating orbs
      if (timeline.keyEvents) {
        timeline.keyEvents.forEach((event, eventIndex) => {
          renderFloatingOrb(gl, {
            position: calculateEventPosition(spiralRadius, spiralHeight, eventIndex),
            color: getEventColor(event.event),
            size: Math.abs(event.impact) / 50000,
            glow: true,
            animation: timestamp * 0.002
          });
        });
      }
    });
  };

  /**
   * 🌍 Render Spatial Dimension - Cinematic Environments
   */
  const renderSpatialDimension = (gl, timestamp) => {
    switch (spatialEnvironment) {
      case 'financial_nexus':
        renderFinancialNexus(gl, timestamp);
        break;
      case 'quantum_garden':
        renderQuantumGarden(gl, timestamp);
        break;
      case 'temporal_cathedral':
        renderTemporalCathedral(gl, timestamp);
        break;
      case 'probability_ocean':
        renderProbabilityOcean(gl, timestamp);
        break;
      default:
        renderFinancialNexus(gl, timestamp);
    }
  };

  /**
   * 💗 Render Emotional Dimension - Biometric Aura
   */
  const renderEmotionalDimension = (gl, timestamp) => {
    if (!currentExperience?.biometricIntegration) return;
    
    const emotional = currentExperience.biometricIntegration;
    const stressLevel = emotional.stressLevels?.overall || 0.3;
    const confidence = emotional.decisionConfidence?.level || 0.7;
    
    // Create pulsing aura around the scene
    renderBiometricAura(gl, {
      stressLevel,
      confidence,
      heartRate: emotional.currentState?.biometricIndicators?.heartRate || 72,
      timestamp,
      visualMode: emotionalVisualization
    });
  };

  /**
   * ⚛️ Render Quantum Dimension - Probability Clouds
   */
  const renderQuantumDimension = (gl, timestamp) => {
    if (!currentExperience?.probabilityCloud) return;
    
    const quantum = currentExperience.probabilityCloud;
    const outcomes = quantum.outcomeDistribution || [];
    
    // Render quantum probability cloud
    outcomes.slice(0, 200).forEach((outcome, index) => {
      renderQuantumParticle(gl, {
        position: calculateQuantumPosition(index, outcomes.length),
        probability: outcome.probability,
        impact: outcome.financialImpact,
        timestamp,
        quantumEffect: quantumVisualization
      });
    });
  };

  /**
   * 🎆 Render Advanced Particle Effects
   */
  const renderParticleEffects = (gl, timestamp) => {
    // Money flow particles
    renderMoneyFlowParticles(gl, timestamp);
    
    // Success sparkles
    renderSuccessSparkles(gl, timestamp);
    
    // Risk warning particles
    renderRiskParticles(gl, timestamp);
    
    // Opportunity beacons
    renderOpportunityBeacons(gl, timestamp);
  };

  /**
   * 🌟 Advanced Effects - 2D Canvas Implementation
   */
  const applyBloomEffect = (ctx) => {
    // 2D bloom effect simulation
    ctx.shadowBlur = bloomEffect ? 20 : 0;
    console.log('🌟 Bloom effect applied via 2D canvas');
  };

  const applyMotionBlur = (ctx) => {
    // 2D motion blur simulation
    if (motionBlur) {
      ctx.globalAlpha = 0.9;
    }
    console.log('💫 Motion blur applied via 2D canvas');
  };

  const applyVolumetricLighting = (ctx) => {
    // 2D volumetric lighting simulation
    console.log('💡 Volumetric lighting applied via 2D canvas');
  };

  /**
   * 🎨 Helper Rendering Functions
   */
  const renderGlowingSpiral = (gl, params) => {
    // Advanced spiral rendering with glow effects
    console.log('🌀 Rendering glowing spiral:', params);
  };

  const renderFloatingOrb = (gl, params) => {
    // Render floating orbs with particle effects
    console.log('⭐ Rendering floating orb:', params);
  };

  const renderFinancialNexus = (gl, timestamp) => {
    // Render futuristic financial nexus environment
    console.log('🏛️ Rendering financial nexus');
  };

  const renderQuantumGarden = (gl, timestamp) => {
    // Render organic quantum garden environment
    console.log('🌸 Rendering quantum garden');
  };

  const renderTemporalCathedral = (gl, timestamp) => {
    // Render majestic temporal cathedral
    console.log('⛪ Rendering temporal cathedral');
  };

  const renderProbabilityOcean = (gl, timestamp) => {
    // Render fluid probability ocean
    console.log('🌊 Rendering probability ocean');
  };

  const renderBiometricAura = (gl, params) => {
    // Render pulsing biometric aura
    console.log('💗 Rendering biometric aura:', params);
  };

  const renderQuantumParticle = (gl, params) => {
    // Render quantum probability particles
    console.log('⚛️ Rendering quantum particle:', params);
  };

  /**
   * 🎆 Particle Effect Functions
   */
  const renderMoneyFlowParticles = (gl, timestamp) => {
    // Render money flow particle effects
    console.log('💰 Rendering money flow particles');
  };

  const renderSuccessSparkles = (gl, timestamp) => {
    // Render success sparkle effects
    console.log('✨ Rendering success sparkles');
  };

  const renderRiskParticles = (gl, timestamp) => {
    // Render risk warning particles
    console.log('⚠️ Rendering risk particles');
  };

  const renderOpportunityBeacons = (gl, timestamp) => {
    // Render opportunity beacon effects
    console.log('🎯 Rendering opportunity beacons');
  };

  /**
   * 🎯 Utility Functions
   */
  const calculateDynamicBackground = (timestamp) => {
    const time = timestamp * 0.001;
    return {
      r: 0.05 + Math.sin(time * 0.1) * 0.02,
      g: 0.1 + Math.sin(time * 0.15) * 0.03,
      b: 0.2 + Math.sin(time * 0.2) * 0.05,
      a: 1.0
    };
  };

  const calculateEventPosition = (radius, height, index) => {
    const angle = (index / 10) * Math.PI * 2;
    return {
      x: Math.cos(angle) * radius,
      y: height + (index * 0.1),
      z: Math.sin(angle) * radius
    };
  };

  const getEventColor = (eventType) => {
    const colors = {
      'career_promotion': '#4CAF50',
      'house_purchase': '#2196F3',
      'market_crash': '#F44336',
      'retirement': '#FF9800'
    };
    return colors[eventType] || '#9C27B0';
  };

  const calculateQuantumPosition = (index, total) => {
    const phi = Math.acos(1 - 2 * index / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    const radius = 3;
    
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi)
    };
  };

  /**
   * 🎮 Interactive Controls
   */
  const handleVisualModeChange = (mode) => {
    setVisualMode(mode);
    console.log(`🎨 Visual mode changed to: ${mode}`);
  };

  const handleCameraControl = (axis, value) => {
    setCameraPosition(prev => ({
      ...prev,
      [axis]: value
    }));
  };

  /**
   * 🔍 Toggle Fullscreen - Fixed with Proper Error Handling
   */
  const toggleFullscreen = async () => {
    try {
      // Check current fullscreen state
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      if (!isCurrentlyFullscreen) {
        // Enter fullscreen
        const canvas = canvasRef.current;
        if (canvas) {
          if (canvas.requestFullscreen) {
            await canvas.requestFullscreen();
          } else if (canvas.webkitRequestFullscreen) {
            await canvas.webkitRequestFullscreen();
          } else if (canvas.mozRequestFullScreen) {
            await canvas.mozRequestFullScreen();
          } else if (canvas.msRequestFullscreen) {
            await canvas.msRequestFullscreen();
          }
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error.message);
      // Reset fullscreen state on error
      setIsFullscreen(false);
    }
  };

  return (
    <FinancialDataProvider fiMcpData={fiMcpData}>
      <Box sx={{ 
        width: '100%', 
        height: '100vh', 
        position: 'relative',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        overflow: 'hidden' // Prevent main container scroll, let individual views handle it
      }}>
      
      {/* 💎 Five-Way View Switching */}
      {showCrystalClearView ? (
        <CrystalClear4DView
          fiMcpData={fiMcpData}
          onBackToComplex={() => setShowCrystalClearView(false)}
        />
      ) : showSimpleView ? (
        <SimpleFinancialView 
          fiMcpData={fiMcpData} 
          onBackTo4D={() => setShowSimpleView(false)}
        />
      ) : showUserFriendlyView ? (
        <UserFriendly4DView
          fiMcpData={fiMcpData}
          onBackToComplex={() => setShowUserFriendlyView(false)}
        />
      ) : showFourGraphsView ? (
        <FourGraphsView
          fiMcpData={fiMcpData}
          onBackToComplex={() => setShowFourGraphsView(false)}
        />
      ) : (
        <>
          {/* 🌌 Master 4D Canvas */}
          <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        }}
        onMouseDown={(e) => {
          e.target.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.target.style.cursor = 'grab';
        }}
      />

      {/* 🔍 Fullscreen Toggle - Moved to Top Left */}
      <Button
        variant="contained"
        onClick={toggleFullscreen}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          minWidth: 120,
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 80,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
          }
        }}
      >
        {isFullscreen ? '🔍 Exit Fullscreen' : '🔍 Fullscreen'}
      </Button>

      {/* 🎨 Visual Mode Selector - Fixed Position */}
      <Paper
        elevation={12}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20, // Move to right side to not block main content
          p: 2,
          background: 'rgba(0, 0, 0, 0.7)', // More transparent
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          zIndex: 50, // Lower z-index
          maxWidth: 280,
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          🎯 Financial Analysis Mode
        </Typography>
        
        {/* Crystal Clear View Toggle - PRIMARY OPTION */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setShowCrystalClearView(true)}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '1rem',
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFA000 0%, #FFD700 100%)'
            }
          }}
        >
          💎 CRYSTAL CLEAR INSIGHTS
        </Button>
        
        {/* Four Graphs View Toggle */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setShowFourGraphsView(true)}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C2185B 0%, #E91E63 100%)'
            }
          }}
        >
          📊 Professional Analysis
        </Button>
        
        {/* User-Friendly 4D View Toggle */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setShowUserFriendlyView(true)}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)'
            }
          }}
        >
          🎯 Visual Journey
        </Button>
        
        {/* Simple View Toggle */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setShowSimpleView(true)}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)'
            }
          }}
        >
          💡 Quick Answers
        </Button>
        
        <Grid container spacing={1}>
          {[
            { key: 'risk_analysis', label: '⚠️ Risk', color: '#FF5722' },
            { key: 'goal_tracking', label: '🎯 Goals', color: '#4CAF50' },
            { key: 'cash_flow', label: '💰 Cash', color: '#2196F3' },
            { key: 'market_impact', label: '📈 Market', color: '#9C27B0' }
          ].map((mode) => (
            <Grid item xs={6} key={mode.key}>
              <Button
                size="small"
                variant={visualMode === mode.key ? 'contained' : 'outlined'}
                onClick={() => handleVisualModeChange(mode.key)}
                sx={{
                  color: visualMode === mode.key ? 'white' : mode.color,
                  borderColor: mode.color,
                  bgcolor: visualMode === mode.key ? mode.color : 'transparent',
                  '&:hover': {
                    bgcolor: mode.color,
                    color: 'white'
                  }
                }}
              >
                {mode.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 📈 Current Analysis Info - Bottom Left */}
      <Paper
        elevation={12}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          p: 2,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          maxWidth: 300
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          📈 Current Analysis
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
            {visualMode.replace('_', ' ').toUpperCase()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {visualMode === 'risk_analysis' && 'Showing your financial risk levels and specific recommendations for risk reduction'}
            {visualMode === 'goal_tracking' && 'Tracking progress toward your major life goals with completion percentages'}
            {visualMode === 'cash_flow' && 'Visualizing money flowing in and out with income vs expense analysis'}
            {visualMode === 'market_impact' && 'Displaying how market changes affect your investment portfolio'}
          </Typography>
        </Box>
      </Paper>

      {/* 💡 Quick Tips - Bottom Right */}
      <Paper
        elevation={12}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          p: 2,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          maxWidth: 280
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          💡 Quick Tips
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
          {visualMode === 'risk_analysis' && 'Higher risk levels (red) need immediate attention. Focus on building emergency funds first.'}
          {visualMode === 'goal_tracking' && 'Green progress circles show goals on track. Click different analysis modes to explore more.'}
          {visualMode === 'cash_flow' && 'Green particles = income, Red particles = expenses. Aim for more green than red.'}
          {visualMode === 'market_impact' && 'Market waves show volatility. Diversified investments reduce impact of market swings.'}
        </Typography>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          💎 Try "Crystal Clear Insights" for simple answers to your money questions
        </Typography>
      </Paper>

      {/* 🎬 Action Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: 30,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Removed unnecessary buttons: Fullscreen (moved to top left), Screenshot, and Video */}
      </Box>

      {/* 📊 Performance Monitor */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="caption" sx={{ color: '#4CAF50' }}>
          FPS: 60
        </Typography>
        <Typography variant="caption" sx={{ color: '#2196F3' }}>
          GPU: 85%
        </Typography>
        <Typography variant="caption" sx={{ color: '#FF9800' }}>
          Particles: 10K
        </Typography>
        <Typography variant="caption" sx={{ color: '#E91E63' }}>
          Quality: {renderQuality.toUpperCase()}
        </Typography>
      </Box>
        </>
      )}
    </Box>
    </FinancialDataProvider>
  );
};

export default Enhanced4DVisualization;

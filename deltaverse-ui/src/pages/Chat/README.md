# AI Chat Feature

## Overview
The AI Chat feature provides users with an intelligent financial assistant that can answer questions about budgeting, investments, financial planning, and more.

## Components

### Chat.jsx
Main chat page component that handles:
- Message state management
- API communication
- User interaction
- Error handling
- Loading states

### ChatMessage.jsx
Individual message component that displays:
- User and AI messages with different styling
- Timestamps and sender information
- Suggestion buttons for follow-up questions
- Error message handling

### ChatInput.jsx
Input component featuring:
- Auto-resizing textarea
- Send button with loading state
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Input validation

## Features

### Core Functionality
- Real-time chat interface
- AI-powered responses
- Message history
- Suggestion chips for common questions
- Error handling and retry mechanisms

### User Experience
- Responsive design for mobile and desktop
- Typing indicators
- Smooth scrolling to new messages
- Clear chat functionality
- Navigation back to dashboard

### Mock AI Responses
The chat includes intelligent mock responses for development:
- Budget optimization advice
- Investment recommendations
- Retirement planning guidance
- General financial assistance

## API Integration

### Development Mode
- Uses mock responses with realistic delays
- Simulates various financial scenarios
- Provides contextual suggestions

### Production Mode
- Connects to backend AI service
- Maintains chat history
- Personalized recommendations based on user data

## Styling
- Consistent with existing design system
- Modern chat interface design
- Accessible color contrast
- Mobile-first responsive design

## Navigation
- Integrated with main app routing
- Accessible from dashboard
- Protected route requiring authentication
- Smooth transitions between pages

## Future Enhancements
- Voice input/output
- File attachments for financial documents
- Chat export functionality
- Advanced AI features like chart generation
- Integration with user's financial data for personalized advice
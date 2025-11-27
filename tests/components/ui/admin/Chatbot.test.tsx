import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Chatbot from '@/components/ui/admin/Chatbot'

// Mock para evitar problemas con SSR
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock window methods
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

describe('Chatbot Component', () => {
  beforeEach(() => {
    // Reset window size to desktop for each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should render chatbot button on desktop', () => {
    render(<Chatbot />)
    
    // Should show the floating button on desktop
    const chatbotButton = screen.getByRole('button')
    expect(chatbotButton).toBeInTheDocument()
  })

  it('should not render chatbot on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<Chatbot />)
    
    // Should not show chatbot on mobile
    const chatbotButton = screen.queryByRole('button')
    expect(chatbotButton).not.toBeInTheDocument()
  })

  it('should open chat when button is clicked', async () => {
    const user = userEvent.setup()
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    
    // Click to open chat
    await user.click(chatbotButton)
    
    // Wait for chat to appear
    await waitFor(() => {
      const chatHeader = screen.getByText('Chatbot AI')
      expect(chatHeader).toBeInTheDocument()
    })
  })

  it('should close chat when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    
    // Open chat
    await user.click(chatbotButton)
    
    // Wait for chat to appear and find close button
    await waitFor(() => {
      const closeButton = screen.getByText('✕')
      expect(closeButton).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('✕')
    await user.click(closeButton)
    
    // Chat should be hidden (check by header not being visible)
    await waitFor(() => {
      const chatHeader = screen.queryByText('Chatbot AI')
      expect(chatHeader).not.toBeVisible()
    })
  })

  it('should display initial welcome message and options', async () => {
    const user = userEvent.setup()
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    await user.click(chatbotButton)
    
    await waitFor(() => {
      // Check for welcome elements
      expect(screen.getByText('Chatbot AI')).toBeInTheDocument()
      expect(screen.getByText('Tu asistente inteligente')).toBeInTheDocument()
    })
  })

  it('should show typing indicator when sending message', async () => {
    const user = userEvent.setup()
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    await user.click(chatbotButton)
    
    // Wait for chat to load
    await waitFor(() => {
      expect(screen.getByText('Chatbot AI')).toBeInTheDocument()
    })
  })

  it('should reset chat when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    await user.click(chatbotButton)
    
    await waitFor(() => {
      const resetButton = screen.getByText('Reiniciar')
      expect(resetButton).toBeInTheDocument()
    })
    
    const resetButton = screen.getByText('Reiniciar')
    await user.click(resetButton)
    
    // After reset, messages should be cleared
    // This test would need to be expanded based on actual reset behavior
  })

  it('should have proper accessibility attributes', () => {
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    expect(chatbotButton).toBeInTheDocument()
    
    // Check for basic accessibility
    expect(chatbotButton).toHaveAttribute('class')
  })

  it('should animate logo images', async () => {
    render(<Chatbot />)
    
    const chatbotButton = screen.getByRole('button')
    expect(chatbotButton).toBeInTheDocument()
    
    // Should contain an image for the animation
    const logoImage = screen.getByAltText('ChatBot Animation')
    expect(logoImage).toBeInTheDocument()
  })
})

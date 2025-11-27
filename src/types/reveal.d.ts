declare module 'reveal.js' {
  export interface RevealOptions {
    embedded?: boolean
    width?: number
    height?: number
    margin?: number
    minScale?: number
    maxScale?: number
    controls?: boolean
    progress?: boolean
    center?: boolean
    hash?: boolean
    transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'
    backgroundTransition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'
  }

  export interface RevealApi {
    initialize(options?: RevealOptions): Promise<void>
    destroy(): void
    sync(): void
    slide(indexh: number, indexv?: number, f?: number): void
    next(): void
    prev(): void
    navigateLeft(): void
    navigateRight(): void
    navigateUp(): void
    navigateDown(): void
    navigatePrev(): void
    navigateNext(): void
    layout(): void
    shuffle(): void
    availableRoutes(): { left: boolean; right: boolean; up: boolean; down: boolean }
    toggleOverview(override?: boolean): void
    togglePause(override?: boolean): void
    toggleAutoSlide(override?: boolean): void
    isOverview(): boolean
    isPaused(): boolean
    isAutoSliding(): boolean
    isSpeakerNotes(): boolean
    getProgress(): number
    getTotalSlides(): number
    getIndices(): { h: number; v: number; f?: number }
    getSlides(): HTMLElement[]
    getPreviousSlide(): HTMLElement | null
    getCurrentSlide(): HTMLElement
    getScale(): number
    getConfig(): RevealOptions
    getQueryHash(): Record<string, string>
    configure(options: RevealOptions): void
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }

  export default class Reveal {
    constructor(element: HTMLElement, options?: RevealOptions)
    initialize(options?: RevealOptions): Promise<RevealApi>
    destroy(): void
    sync(): void
    slide(indexh: number, indexv?: number, f?: number): void
    next(): void
    prev(): void
    navigateLeft(): void
    navigateRight(): void
    navigateUp(): void
    navigateDown(): void
    navigatePrev(): void
    navigateNext(): void
    layout(): void
    shuffle(): void
    availableRoutes(): { left: boolean; right: boolean; up: boolean; down: boolean }
    toggleOverview(override?: boolean): void
    togglePause(override?: boolean): void
    toggleAutoSlide(override?: boolean): void
    isOverview(): boolean
    isPaused(): boolean
    isAutoSliding(): boolean
    isSpeakerNotes(): boolean
    getProgress(): number
    getTotalSlides(): number
    getIndices(): { h: number; v: number; f?: number }
    getSlides(): HTMLElement[]
    getPreviousSlide(): HTMLElement | null
    getCurrentSlide(): HTMLElement
    getScale(): number
    getConfig(): RevealOptions
    getQueryHash(): Record<string, string>
    configure(options: RevealOptions): void
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }

  export namespace Reveal {
    export type Api = RevealApi
  }
}

declare module 'reveal.js/dist/reveal.css' {
  const content: string
  export default content
}

declare module 'reveal.js/dist/theme/white.css' {
  const content: string
  export default content
}

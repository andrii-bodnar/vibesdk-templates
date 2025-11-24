import React from 'react'
import { createRoot } from 'react-dom/client'
import { jsxImport } from '../compiler/index.js'
import { validateAndFixSlide } from '../utils/slideValidation.js'

export class PresentationLoader {
    constructor() {
        this.slides = []
        this.manifest = null
        this.Presentation = null
    }

    async loadManifest() {
        try {
            const response = await fetch('/slides/manifest.json', { cache: 'no-store' })
            if (response.ok) {
                this.manifest = await response.json()
                console.log('[PresentationLoader] Manifest loaded:', this.manifest)
                return this.manifest
            }
        } catch (error) {
            console.warn('[PresentationLoader] No manifest.json found:', error.message)
        }
        return null
    }

    async loadSlideJSON(filename) {
        try {
            const response = await fetch(`/slides/${filename}`, { cache: 'no-store' })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const slideData = await response.json()
            const sanitized = validateAndFixSlide(slideData)

            console.log(`[PresentationLoader] Loaded slide: ${filename}`, sanitized)
            return sanitized
        } catch (error) {
            console.error(`[PresentationLoader] Error loading ${filename}:`, error)
            throw error
        }
    }

    async loadPresentation() {
        try {
            const presentationModule = await jsxImport('/_dev/Presentation.jsx')
            this.Presentation = presentationModule.default
        } catch (error) {
            console.error('[PresentationLoader] Failed to load Presentation component:', error)
            throw error
        }
    }

    async loadAllSlides() {
        await this.loadManifest()

        // STRICT MODE: Only load slides from manifest
        const slideFiles = this.manifest?.slides || []

        if (slideFiles.length === 0) {
            console.warn('[PresentationLoader] No slides found in manifest.json');
        }

        console.log(`[PresentationLoader] Loading ${slideFiles.length} slides from manifest:`, slideFiles)

        const slideData = []
        for (const file of slideFiles) {
            try {
                const data = await this.loadSlideJSON(file)
                slideData.push(data)
            } catch (error) {
                console.error(`[PresentationLoader] Skipping invalid slide ${file}:`, error)
            }
        }

        this.slides = slideData
        return slideData
    }
}

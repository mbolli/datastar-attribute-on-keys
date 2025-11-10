import { test } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import onKeysPlugin from './index.js'

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
global.window = dom.window as any
global.KeyboardEvent = dom.window.KeyboardEvent as any

test('onKeysPlugin returns an AttributePlugin object', () => {
    const plugin = onKeysPlugin(() => {}, () => {})
    
    assert.strictEqual(plugin.name, 'on-keys')
    assert.strictEqual(plugin.returnsValue, true)
    assert.deepStrictEqual(plugin.requirement, { value: 'must' })
    assert.deepStrictEqual(plugin.argNames, ['evt'])
    assert.strictEqual(typeof plugin.apply, 'function')
})

test('plugin has correct structure', () => {
    const plugin = onKeysPlugin(() => {}, () => {})
    
    assert.ok(plugin)
    assert.ok(plugin.name)
    assert.ok(plugin.apply)
    assert.ok(plugin.requirement)
})

test('handles single key press with key normalization', () => {
    let callbackTriggered = false
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const key = 'escape'  // lowercase in spec
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // Simulate escape key press on window (default target)
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Check callback was triggered
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('handles key combinations with modifiers', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const key = 'alt-q'
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // Simulate alt+q key press - event fires on window by default
    const event = new (dom.window as any).KeyboardEvent('keydown', { 
        key: 'q', 
        altKey: true 
    })
    dom.window.dispatchEvent(event)
    
    // Check callback was triggered
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('handles multiple key specifications', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const key = 'escape.enter.alt-q'  // Using . for multiple keys and - for combinations
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // Test escape key
    callbackTriggered = false
    let event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test enter key
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Enter' })
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test alt-q key combination
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'q', altKey: true })
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test unmatched key
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'x' })
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, false)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('event handler targets correct element with "el" modifier', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    
    // Plugin with "el" modifier
    const key = 'space'
    const mods = new Map<string, Set<string>>([['el', new Set<string>()]])
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        mods,
        rx,
    } as any)
    
    // Fire event on the window - should NOT trigger since we specified element targeting
    const windowEvent = new (dom.window as any).KeyboardEvent('keydown', { key: ' ' })
    dom.window.dispatchEvent(windowEvent)
    assert.strictEqual(callbackTriggered, false)
    
    // Fire event on the element - should trigger
    const elementEvent = new (dom.window as any).KeyboardEvent('keydown', { key: ' ' })
    el.dispatchEvent(elementEvent)
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('defaults to global window event handling', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const key = 'enter'
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin WITHOUT element modifier
    const cleanup = plugin.apply({
        el,
        key,
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // Fire event on window - should trigger by default
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Enter' })
    dom.window.dispatchEvent(event)
    
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('cleanup function removes event listener', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const rx = () => { callbackTriggered = true }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // Call cleanup
    if (cleanup) cleanup()
    
    // Try to trigger event after cleanup on window
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Callback should not be triggered after cleanup
    assert.strictEqual(callbackTriggered, false)
})

test('handles key normalization for special keys', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const rx = () => { callbackTriggered = true }
    
    const cleanup = plugin.apply({
        el,
        key: 'space',  // lowercase alias
        mods: new Map<string, Set<string>>(),
        rx,
    } as any)
    
    // JavaScript event.key for space is ' ' (space character)
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: ' ' })
    dom.window.dispatchEvent(event)
    
    assert.strictEqual(callbackTriggered, true)
    
    if (cleanup) cleanup()
})

test('delay modifier delays callback execution', async () => {
    const callbackTimes: number[] = []
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['delay', new Set<string>(['100ms'])]])
    const rx = () => { callbackTimes.push(Date.now()) }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const startTime = Date.now()
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Callback should not be triggered immediately
    assert.strictEqual(callbackTimes.length, 0)
    
    // Wait for delay to pass
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Callback should now be triggered
    assert.strictEqual(callbackTimes.length, 1)
    const elapsed = callbackTimes[0] - startTime
    assert.ok(elapsed >= 100, `Expected delay >= 100ms, got ${elapsed}ms`)
    
    if (cleanup) cleanup()
})

test('delay modifier supports seconds notation', async () => {
    const callbackTimes: number[] = []
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['delay', new Set<string>(['0.1s'])]])
    const rx = () => { callbackTimes.push(Date.now()) }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const startTime = Date.now()
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Wait for delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    assert.strictEqual(callbackTimes.length, 1)
    const elapsed = callbackTimes[0] - startTime
    assert.ok(elapsed >= 100, `Expected delay >= 100ms, got ${elapsed}ms`)
    
    if (cleanup) cleanup()
})

test('debounce modifier debounces rapid key presses', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['debounce', new Set<string>(['100ms'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    // Fire multiple events in rapid succession
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    
    // Callback should not be triggered yet
    assert.strictEqual(callbackCount, 0)
    
    // Wait for debounce to complete
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Callback should be triggered only once
    assert.strictEqual(callbackCount, 1)
    
    if (cleanup) cleanup()
})

test('debounce modifier with leading option', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['debounce', new Set<string>(['100ms', 'leading'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Callback should be triggered immediately with leading option
    assert.strictEqual(callbackCount, 1)
    
    // Fire more events rapidly
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    
    // Wait for debounce to complete
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Should be triggered once at start and once at end (trailing is true by default)
    assert.strictEqual(callbackCount, 2)
    
    if (cleanup) cleanup()
})

test('debounce modifier with notrailing option', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['debounce', new Set<string>(['100ms', 'notrailing'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    
    // Wait for debounce period
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // With notrailing, callback should not be triggered
    assert.strictEqual(callbackCount, 0)
    
    if (cleanup) cleanup()
})

test('throttle modifier throttles rapid key presses', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['throttle', new Set<string>(['100ms'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    
    // First event - should trigger immediately (leading by default)
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 1)
    
    // Second event within throttle period - should not trigger
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 1)
    
    // Third event still within period - should not trigger
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 1)
    
    // Wait for throttle period to end
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Fourth event after throttle period - should trigger
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 2)
    
    if (cleanup) cleanup()
})

test('throttle modifier with trailing option', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['throttle', new Set<string>(['100ms', 'trailing'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    
    // Fire multiple events
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 1) // Leading fires
    
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    
    await new Promise(resolve => setTimeout(resolve, 20))
    dom.window.dispatchEvent(event)
    
    // Wait for throttle period to end
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Trailing should fire
    assert.strictEqual(callbackCount, 2)
    
    if (cleanup) cleanup()
})

test('throttle modifier with noleading option', async () => {
    let callbackCount = 0
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['throttle', new Set<string>(['100ms', 'noleading'])]])
    const rx = () => { callbackCount++ }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    
    // First event should not trigger immediately with noleading
    dom.window.dispatchEvent(event)
    assert.strictEqual(callbackCount, 0)
    
    // Wait for throttle period
    await new Promise(resolve => setTimeout(resolve, 120))
    
    // Still should be 0 (no trailing by default)
    assert.strictEqual(callbackCount, 0)
    
    if (cleanup) cleanup()
})

test('viewtransition modifier wraps callback in startViewTransition', () => {
    let callbackTriggered = false
    let viewTransitionStarted = false
    
    // Mock startViewTransition
    const originalStartViewTransition = (document as any).startViewTransition
    ;(document as any).startViewTransition = (callback: () => void) => {
        viewTransitionStarted = true
        callback()
    }
    
    const plugin = onKeysPlugin(() => {}, () => {})
    const el = document.createElement('div')
    const mods = new Map<string, Set<string>>([['viewtransition', new Set<string>()]])
    const rx = () => { callbackTriggered = true }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        mods,
        rx,
    } as any)
    
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    dom.window.dispatchEvent(event)
    
    // Both callback and view transition should be triggered
    assert.strictEqual(callbackTriggered, true)
    assert.strictEqual(viewTransitionStarted, true)
    
    // Restore original
    if (originalStartViewTransition) {
        (document as any).startViewTransition = originalStartViewTransition
    } else {
        delete (document as any).startViewTransition
    }
    
    if (cleanup) cleanup()
})

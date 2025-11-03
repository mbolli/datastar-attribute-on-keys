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

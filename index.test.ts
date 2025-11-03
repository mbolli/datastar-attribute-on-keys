// Basic tests for the on-keys plugin
import { test } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import onKeysPlugin from './index.js'
import * as datastar from 'datastar/bundles/datastar-core.js'

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document as any
global.window = dom.window as any
global.MutationObserver = dom.window.MutationObserver as any

test('onKeysPlugin returns an AttributePlugin object', () => {
    const plugin = onKeysPlugin()
    
    assert.strictEqual(plugin.name, 'on-keys')
    assert.strictEqual(plugin.requirement, 'must')
    assert.deepStrictEqual(plugin.argNames, ['evt'])
    assert.strictEqual(typeof plugin.apply, 'function')
})

test('plugin has correct structure', () => {
    const plugin = onKeysPlugin()
    
    assert.ok(plugin)
    assert.ok(plugin.name)
    assert.ok(plugin.apply)
    assert.ok(plugin.requirement)
})

test('handles single key press', () => {
    let callbackTriggered = false
    const plugin = onKeysPlugin()
    const el = document.createElement('div')
    const key = 'escape'
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        value: '$modal.close()',
        rx,
        rawKey: 'on-keys:escape',
        mods: new Map(),
        error: () => {}
    } as any)
    
    // Simulate escape key press
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    el.dispatchEvent(event)
    
    // Check callback was triggered
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('handles key combinations with modifiers', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin()
    const el = document.createElement('div')
    const key = 'alt+q'
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        value: '$quit()',
        rx,
        rawKey: 'on-keys:alt+q',
        mods: new Map(),
        error: () => {}
    } as any)
    
    // Simulate alt+q key press
    const event = new (dom.window as any).KeyboardEvent('keydown', { 
        key: 'q', 
        altKey: true 
    })
    el.dispatchEvent(event)
    
    // Check callback was triggered
    assert.strictEqual(callbackTriggered, true)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('handles multiple key specifications', () => {
    let callbackTriggered = false
  
    
    const plugin = onKeysPlugin()
    const el = document.createElement('div')
    const key = 'escape,enter,alt+q'
    const rx = () => { callbackTriggered = true }
    
    // Apply the plugin
    const cleanup = plugin.apply({
        el,
        key,
        value: '$action()',
        rx,
        rawKey: 'on-keys:escape,enter,alt+q',
        mods: new Map(),
        error: () => {}
    } as any)
    
    // Test escape key
    callbackTriggered = false
    let event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    el.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test enter key
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Enter' })
    el.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test alt+q key combination
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'q', altKey: true })
    el.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, true)
    
    // Test unmatched key
    callbackTriggered = false
    event = new (dom.window as any).KeyboardEvent('keydown', { key: 'x' })
    el.dispatchEvent(event)
    assert.strictEqual(callbackTriggered, false)
    
    // Cleanup
    if (cleanup) cleanup()
})

test('cleanup function removes event listener', () => {
    let callbackTriggered = false
    
    const plugin = onKeysPlugin()
    const el = document.createElement('div')
    const rx = () => { callbackTriggered = true }
    
    const cleanup = plugin.apply({
        el,
        key: 'escape',
        value: '$action()',
        rx,
        rawKey: 'on-keys:escape',
        mods: new Map(),
        error: () => {}
    } as any)
    
    // Call cleanup
    if (cleanup) cleanup()
    
    // Try to trigger event after cleanup
    const event = new (dom.window as any).KeyboardEvent('keydown', { key: 'Escape' })
    el.dispatchEvent(event)
    
    // Callback should not be triggered after cleanup
    assert.strictEqual(callbackTriggered, false)
})

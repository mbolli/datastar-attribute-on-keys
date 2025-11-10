// Datastar Attribute Plugin: data-on-keys
// Custom attribute to bind actions to key presses

import type { AttributePlugin } from 'datastar/library/src/engine/types'

// Auto-register with datastar if available from importmap
if (typeof window !== 'undefined') {
    // Try to import datastar dynamically if it's available via importmap
    (async () => {
        try {
            // @ts-ignore - datastar may be available via importmap at runtime
            const datastar = await import('datastar')
            if (datastar?.attribute) {
                datastar.attribute(onKeysPlugin(datastar.beginBatch, datastar.endBatch))
            }
        } catch (e) {
            // Datastar not available via importmap, plugin needs manual registration
        }
    })()
}

// Helper function to parse key combinations
function parseKeyCombo(keyCombo: string): { key: string; modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean } } {
    // Use - for key combinations: ctrl-k
    const parts = keyCombo.toLowerCase().split('-').map(p => p.trim());
    const modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean } = {};
    let key = '';

    for (const part of parts) {
        switch (part) {
            case 'ctrl':
            case 'control':
                modifiers.ctrl = true;
                break;
            case 'alt':
                modifiers.alt = true;
                break;
            case 'shift':
                modifiers.shift = true;
                break;
            case 'meta':
            case 'cmd':
            case 'command':
                modifiers.meta = true;
                break;
            default:
                key = part;
                break;
        }
    }

    return { key, modifiers };
}

// Helper function to normalize key names
function normalizeKey(key: string): string {
    // For single letter keys, keep them as-is (lowercase)
    if (key.length === 1 && /[a-z]/.test(key)) {
        return key;
    }
    
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    const keyMap: Record<string, string> = {
        'Space': ' ',
        'Return': 'Enter',
        'Esc': 'Escape',
        'Del': 'Delete',
        'Pageup': 'PageUp',
        'Pagedown': 'PageDown',
        'Up': 'ArrowUp',
        'Down': 'ArrowDown',
        'Left': 'ArrowLeft',
        'Right': 'ArrowRight',
    };

    return keyMap[capitalized] || capitalized;
}

// Helper function to check if event matches key combination
function matchesKeyCombo(event: KeyboardEvent, keyCombo: string): boolean {
    const { key, modifiers } = parseKeyCombo(keyCombo);
    
    // Normalize both the target key and the event key
    const eventKey = event.key;
    const targetKey = normalizeKey(key);
    
    if (eventKey !== targetKey) {
        return false;
    }

    // Check modifiers
    if (!!modifiers.ctrl !== event.ctrlKey) return false;
    if (!!modifiers.alt !== event.altKey) return false;
    if (!!modifiers.shift !== event.shiftKey) return false;
    if (!!modifiers.meta !== event.metaKey) return false;

    return true;
}

export default function onKeysPlugin(beginBatch: () => void, endBatch: () => void): AttributePlugin {
    return {
        name: 'on-keys',
        requirement: {
            value: 'must',
        },
        argNames: ['evt'],
        returnsValue: true,
        apply({ el, key, mods, rx }: { el: Element; key: string; mods: Modifiers; rx: (event?: Event) => void }) {
            // Parse key combinations from the key parameter
            // Support formats like: "esc", "alt-q", "ctrl-shift-s", "esc.alt-q.enter"
            const keySpecs = key ? key.split('.').map((k: string) => k.trim()) : [];
            
            // Default to window target, use element only when __el modifier is present
            let target: Element | Window | Document = window;
            if (mods.has('el')) target = el;
            
            // Create the core callback that will be wrapped with modifiers
            let callback = (evt?: Event) => {
                beginBatch();
                rx(evt);
                endBatch();
            }
            
            // Apply timing and view transition modifiers
            callback = modifyViewTransition(callback, mods);
            callback = modifyTiming(callback, mods);
            
            // Create the event handler that checks keys and calls the modified callback
            const eventHandler = (evt?: Event) => {
                if (evt) {
                    // Only check key matching for keyboard events
                    if (!(evt instanceof KeyboardEvent)) {
                        return;
                    }
                    // Check if any of the specified key combinations match
                    let shouldTrigger = false;
                    
                    if (keySpecs.length === 0) {
                        // If no specific keys specified, trigger on any key
                        shouldTrigger = true;
                    } else {
                        // Check each key specification
                        for (const keySpec of keySpecs) {
                            if (matchesKeyCombo(evt, keySpec)) {
                                shouldTrigger = true;
                                break;
                            }
                        }
                    }
                     
                    if (!shouldTrigger) {
                        return;
                    }

                    // Prevent default behavior by default, unless noprevent modifier is used
                    if (!mods.has('noprevent') && typeof key !== 'undefined') {
                        evt.preventDefault();
                    }
                    if (mods.has('stop')) {
                        evt.stopPropagation();
                    }
                }
                
                // Execute the modified callback (which may be wrapped with timing/view transition)
                callback(evt);
            }
            
            const evtListOpts: AddEventListenerOptions = {
                capture: mods.has('capture'),
                passive: mods.has('passive'),
                once: mods.has('once'),
            }
            const eventType = mods.has('up') ? 'keyup' : 'keydown';
            
            target.addEventListener(eventType, eventHandler, evtListOpts);
            return () => {
                target.removeEventListener(eventType, eventHandler, evtListOpts);
            }
        }
    } as AttributePlugin;
}

import type { EventCallbackHandler, Modifiers } from 'datastar/library/src/engine/types'

// https://github.com/starfederation/datastar-pro/blob/3d9a83f79e2c940e1e14dd996a36bb79e98800dd/library/src/utils/view-transitions.ts
export const modifyViewTransition = (callback: EventCallbackHandler, mods: Modifiers): EventCallbackHandler => {
  if (mods.has('viewtransition') && !!document.startViewTransition) {
    const cb = callback
    callback = (...args: any[]) =>
      document.startViewTransition(() => cb(...args))
  }

  return callback   
}

// https://github.com/starfederation/datastar-pro/blob/3d9a83f79e2c940e1e14dd996a36bb79e98800dd/library/src/utils/timing.ts
const delay = (
  callback: EventCallbackHandler,
  wait: number,
): EventCallbackHandler => {
  return (...args: any[]) => {
    setTimeout(() => {
      callback(...args)
    }, wait)
  }
}

const debounce = (
  callback: EventCallbackHandler,
  wait: number,
  leading = false,
  trailing = true,
): EventCallbackHandler => {
  let timer: ReturnType<typeof setTimeout> | number = 0
  return (...args: any[]) => {
    timer && clearTimeout(timer)

    if (leading && !timer) {
      callback(...args)
    }

    timer = setTimeout(() => {
      if (trailing) {
        callback(...args)
      }
      timer && clearTimeout(timer)
      timer = 0
    }, wait)
  }
}

const throttle = (
  callback: EventCallbackHandler,
  wait: number,
  leading = true,
  trailing = false,
): EventCallbackHandler => {
  let waiting = false

  return (...args: any[]) => {
    if (waiting) return

    if (leading) {
      callback(...args)
    }

    waiting = true
    setTimeout(() => {
      if (trailing) {
        callback(...args)
      }
      waiting = false
    }, wait)
  }
}

export const modifyTiming = (
  callback: EventCallbackHandler,
  mods: Modifiers,
): EventCallbackHandler => {
  const delayArgs = mods.get('delay')
  if (delayArgs) {
    const wait = tagToMs(delayArgs)
    callback = delay(callback, wait)
  }

  const debounceArgs = mods.get('debounce')
  if (debounceArgs) {
    const wait = tagToMs(debounceArgs)
    const leading = tagHas(debounceArgs, 'leading', false)
    const trailing = !tagHas(debounceArgs, 'notrailing', false)
    callback = debounce(callback, wait, leading, trailing)
  }

  const throttleArgs = mods.get('throttle')
  if (throttleArgs) {
    const wait = tagToMs(throttleArgs)
    const leading = !tagHas(throttleArgs, 'noleading', false)
    const trailing = tagHas(throttleArgs, 'trailing', false)
    callback = throttle(callback, wait, leading, trailing)
  }

  return callback
}

// https://github.com/starfederation/datastar-pro/blob/3d9a83f79e2c940e1e14dd996a36bb79e98800dd/library/src/utils/tags.ts
const tagToMs = (args: Set<string>) => {
  if (!args || args.size <= 0) return 0
  for (const arg of args) {
    if (arg.endsWith('ms')) {
      return +arg.replace('ms', '')
    }
    if (arg.endsWith('s')) {
      return +arg.replace('s', '') * 1000
    }
    try {
      return Number.parseFloat(arg)
    } catch (_) {}
  }
  return 0
}

const tagHas = (
  tags: Set<string>,
  tag: string,
  defaultValue = false,
) => {
  if (!tags) return defaultValue
  return tags.has(tag.toLowerCase())
}

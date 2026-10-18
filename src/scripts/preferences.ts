// Shared preferences retain the browser's reduced-motion choice as the default.
const system = matchMedia('(prefers-reduced-motion: reduce)');
const changes = new EventTarget();
const visitPreferences = new Map<string, string>();
export function readPreference(key: string, fallback = '') {
 if (visitPreferences.has(key)) return visitPreferences.get(key)!;
 try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function savePreference(key: string, value: string) {
 visitPreferences.set(key, value);
 try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ }
}
let motion = readPreference('portfolio-reduced-motion');
export const reducedMotion = {
 get matches() { return motion === 'on' || (motion !== 'off' && system.matches); },
 addEventListener(type: string, listener: EventListenerOrEventListenerObject) { changes.addEventListener(type, listener); }
};
function applyMotion() {
 document.documentElement.toggleAttribute('data-reduced-motion', reducedMotion.matches);
 if (reducedMotion.matches) document.getAnimations().forEach(animation => { try { animation.finish(); } catch { animation.cancel(); } });
 changes.dispatchEvent(new Event('change'));
}
export function setReducedMotion(value: boolean) {
 motion = value ? 'on' : 'off'; savePreference('portfolio-reduced-motion', motion); applyMotion();
}
system.addEventListener('change', applyMotion);
applyMotion();
export function soundEnabled() { return readPreference('workbench-sound') === 'on'; }
export function setSound(value: boolean) {
 savePreference('workbench-sound', value ? 'on' : 'off');
 window.dispatchEvent(new Event('portfolio:sound'));
}

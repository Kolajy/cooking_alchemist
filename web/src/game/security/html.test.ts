import { escapeHtml } from "./html";
function assert(condition: boolean, message: string) { if (!condition) throw new Error(message); }
assert(escapeHtml("<script>") === "&lt;script&gt;", "escapeHtml test");
console.log("=== HTML SECURITY TESTS PASSED ===");

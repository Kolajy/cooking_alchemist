import { escapeHtml, escapeHtmlAttr } from "./html";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// Tests for escapeHtml
assert(escapeHtml("Hello World") === "Hello World", "escapeHtml should not modify strings without special characters");
assert(escapeHtml("") === "", "escapeHtml should return an empty string when given an empty string");

assert(escapeHtml("&") === "&amp;", "escapeHtml should encode ampersand");
assert(escapeHtml("<") === "&lt;", "escapeHtml should encode less-than");
assert(escapeHtml(">") === "&gt;", "escapeHtml should encode greater-than");
assert(escapeHtml('"') === "&quot;", "escapeHtml should encode double quotes");
assert(escapeHtml("'") === "&#39;", "escapeHtml should encode single quotes");

assert(
  escapeHtml("<script>alert('XSS & \"injection\"')</script>") === "&lt;script&gt;alert(&#39;XSS &amp; &quot;injection&quot;&#39;)&lt;/script&gt;",
  "escapeHtml should encode multiple different special characters in the same string"
);

assert(
  escapeHtml("&&&&") === "&amp;&amp;&amp;&amp;",
  "escapeHtml should encode multiple identical special characters"
);

// Tests for escapeHtmlAttr
assert(escapeHtmlAttr("class-name") === "class-name", "escapeHtmlAttr should not modify safe attributes");
assert(escapeHtmlAttr("") === "", "escapeHtmlAttr should handle empty strings");

assert(escapeHtmlAttr('onload="alert(1)"') === "onload=&quot;alert(1)&quot;", "escapeHtmlAttr should encode double quotes");
assert(escapeHtmlAttr("javascript:alert('1')") === "javascript:alert(&#39;1&#39;)", "escapeHtmlAttr should encode single quotes");

console.log("=== HTML SECURITY TESTS PASSED ===");

/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/border-beam.tsx
 * Converted Tailwind styles and Motion offset-distance to native scoped CSS; explicit border mask; muted colors; reduced-motion static frame.
 * CSS lives in app/globals.css because this app renders with React 18, which escapes quotes inside an inline style tag.
 *
 * MIT License
 *
 * Copyright (c) Magic UI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export default function BorderBeam({
  radius = 20,
  active = true,
}: {
  radius?: number;
  active?: boolean;
}) {
  const path = { offsetPath: `rect(0 auto auto 0 round ${radius}px)` };

  return (
    <div
      aria-hidden
      data-motion-example="border-beam"
      data-running={active ? 'true' : 'false'}
      className="mg-border-beam"
      style={{ borderRadius: radius }}
    >
      <div className="mg-border-light" style={path} />
      <div className="mg-border-light mg-border-light-late" style={path} />
    </div>
  );
}

// Shared quiz logic for AIkiPadhai science lessons.
// Supports BOTH markup styles used across the site:
//   Style A (siblings):  <div class="q">Q?</div><button class="opt" data-correct="true">..</button>...<div class="fb"></div>
//   Style B (nested):    <div class="q" data-answer="1">Q? <button class="opt">..</button>... <div class="fb"></div></div>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#quiz .q').forEach(function (q) {
        var opts = [], fb = null, answerIdx = -1;

        // ---- Style B: options nested inside .q ----
        var nested = q.querySelectorAll(':scope > .opt');
        if (nested.length) {
            opts = Array.prototype.slice.call(nested);
            fb = q.querySelector(':scope > .fb');
            answerIdx = parseInt(q.getAttribute('data-answer'), 10);
        } else {
            // ---- Style A: options are following siblings ----
            var el = q.nextElementSibling;
            while (el && el.classList.contains('opt')) { opts.push(el); el = el.nextElementSibling; }
            fb = (el && el.classList.contains('fb')) ? el : null;
            opts.forEach(function (b, i) { if (b.dataset.correct === 'true') answerIdx = i; });
        }

        if (!opts.length || !fb) return;

        opts.forEach(function (btn, i) {
            btn.addEventListener('click', function () {
                opts.forEach(function (b) { b.disabled = true; });
                if (i === answerIdx) {
                    btn.classList.add('correct');
                    fb.textContent = '✅ Sahi jawab! Shaabaash!';
                    fb.style.color = '#16a34a';
                } else {
                    btn.classList.add('wrong');
                    if (opts[answerIdx]) opts[answerIdx].classList.add('correct');
                    fb.textContent = '❌ Oops! Sahi jawab highlight kar diya hai.';
                    fb.style.color = '#dc2626';
                }
            });
        });
    });
});

// Shared quiz logic for AIkiPadhai science lessons
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#quiz .q').forEach(function (q) {
        var el = q.nextElementSibling; var opts = [];
        while (el && el.classList.contains('opt')) { opts.push(el); el = el.nextElementSibling; }
        var fb = el;
        opts.forEach(function (btn) {
            btn.addEventListener('click', function () {
                opts.forEach(function (b) { b.disabled = true; });
                if (btn.dataset.correct === 'true') {
                    btn.classList.add('correct');
                    fb.textContent = '✅ Sahi jawab! Shaabaash!';
                    fb.style.color = '#16a34a';
                } else {
                    btn.classList.add('wrong');
                    opts.forEach(function (b) { if (b.dataset.correct === 'true') b.classList.add('correct'); });
                    fb.textContent = '❌ Oops! Sahi jawab highlight kar diya hai.';
                    fb.style.color = '#dc2626';
                }
            });
        });
    });
});

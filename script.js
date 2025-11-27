document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mark as Complete buttons
    const buttons = document.querySelectorAll('.mark-complete');

    buttons.forEach(btn => {
        const topicId = btn.getAttribute('data-id');
        const statusText = btn.querySelector('.status-text');

        // Check saved state
        if (localStorage.getItem(topicId) === 'completed') {
            markAsCompleted(btn, statusText);
        }

        btn.addEventListener('click', () => {
            if (localStorage.getItem(topicId) === 'completed') {
                // Toggle off
                localStorage.removeItem(topicId);
                markAsIncomplete(btn, statusText);
            } else {
                // Toggle on
                localStorage.setItem(topicId, 'completed');
                markAsCompleted(btn, statusText);
                confettiEffect(btn);
            }
        });
    });
});

function markAsCompleted(btn, textSpan) {
    btn.style.background = 'var(--secondary)';
    btn.style.borderColor = 'var(--secondary)';
    btn.style.color = 'white';
    textSpan.textContent = 'Completed ✓';
}

function markAsIncomplete(btn, textSpan) {
    btn.style.background = 'transparent';
    btn.style.borderColor = 'var(--primary)';
    btn.style.color = 'var(--primary)';
    textSpan.textContent = 'Mark Complete';
}

function confettiEffect(element) {
    // Simple visual feedback animation
    element.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

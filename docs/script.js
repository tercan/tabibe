feather.replace();

/**
 * 1. Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/**
 * 2. Update time in preview
 */
function update_preview_time() {
  const preview_time = document.querySelector('.preview-time');
  const preview_date = document.querySelector('.preview-date');
  if (preview_time) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    preview_time.textContent = hours + ':' + minutes + ':' + seconds;
  }
  if (preview_date) {
    const now = new Date();
    const day = now.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    preview_date.textContent = month + ' ' + day + ', ' + year;
  }
}
update_preview_time();
setInterval(update_preview_time, 1000);

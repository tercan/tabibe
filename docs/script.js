/**
 * 1. Copy the extension-management address after an explicit user action
 */
async function handleCopyAddress(event) {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copyTarget);
  const status = document.getElementById('copy-status');
  if (!target || !status) return;
  try {
    await navigator.clipboard.writeText(target.textContent);
    status.textContent = button.dataset.success;
  } catch {
    status.textContent = button.dataset.error;
  }
}

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', handleCopyAddress);
});

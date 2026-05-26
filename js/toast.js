export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  switch(type) {
    case 'success': icon = '<i class="fa-solid fa-circle-check"></i>'; break;
    case 'error': icon = '<i class="fa-solid fa-circle-exclamation"></i>'; break;
    default: icon = '<i class="fa-solid fa-circle-info"></i>'; break;
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

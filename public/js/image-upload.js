document.querySelectorAll('[data-image-upload]').forEach((widget) => {
  const input = widget.querySelector('[data-image-input]');
  const dropzone = widget.querySelector('[data-dropzone]');
  const preview = widget.querySelector('[data-image-preview]');
  const fileName = widget.querySelector('[data-file-name]');
  let previewUrl = null;
  if (!input || !dropzone || !preview) return;

  const showFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      fileName.textContent = 'Pilih JPG, PNG, atau WEBP';
      fileName.classList.add('text-red-600');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      fileName.textContent = 'File melebihi batas 5 MB';
      fileName.classList.add('text-red-600');
      input.value = '';
      return;
    }
    fileName.textContent = file.name;
    fileName.classList.remove('text-red-600');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
  };

  input.addEventListener('change', () => showFile(input.files[0]));
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('border-brand-orange', 'bg-orange-100');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('border-brand-orange', 'bg-orange-100');
    });
  });
  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    showFile(file);
  });
});

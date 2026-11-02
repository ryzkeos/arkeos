update storage.buckets
set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'text/html', 'font/woff2'
  ]
where id = 'media';

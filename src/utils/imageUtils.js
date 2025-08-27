// Utility function to get proper image URL
export const getImageUrl = (thumbnailUrl, apiUrl = process.env.REACT_APP_API_URL) => {
  if (!thumbnailUrl) {
    return '/default-course-image.jpg';
  }

  // If it's already a full URL (starts with http), use it directly
  if (thumbnailUrl.startsWith('http')) {
    return thumbnailUrl;
  }

  // If it's just a Cloudinary public_id (no slashes), construct the full Cloudinary URL
  if (!thumbnailUrl.includes('/') && !thumbnailUrl.startsWith('.')) {
    return `https://res.cloudinary.com/dkwbac8fy/image/upload/v1/${thumbnailUrl}`;
  }

  // If it's a relative path starting with /, add API URL
  if (thumbnailUrl.startsWith('/')) {
    return `${apiUrl}${thumbnailUrl}`;
  }

  // If it contains edu-uploads, it's likely a Cloudinary path without the base URL
  if (thumbnailUrl.includes('edu-uploads/')) {
    return `https://res.cloudinary.com/dkwbac8fy/image/upload/v1/${thumbnailUrl}`;
  }

  // Default: treat as relative path
  return `${apiUrl}${thumbnailUrl}`;
};
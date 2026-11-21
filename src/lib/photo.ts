'use client'

import { upload } from '@vercel/blob/client'

/** Read + shrink a photo in the browser. Returns a data URL. */
export async function readPhoto(file: File, max = 1024, type = 'image/webp', quality = 0.86): Promise<string> {
  const bmp = await createImageBitmap(file)
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const cv = document.createElement('canvas')
  cv.width = Math.round(bmp.width * s)
  cv.height = Math.round(bmp.height * s)
  cv.getContext('2d')!.drawImage(bmp, 0, 0, cv.width, cv.height)
  return cv.toDataURL(type, quality)
}

async function shrinkDataUrl(src: string, max: number, quality: number): Promise<string> {
  const img = new Image()
  img.src = src
  await img.decode()
  const s = Math.min(1, max / Math.max(img.width, img.height))
  const cv = document.createElement('canvas')
  cv.width = Math.round(img.width * s)
  cv.height = Math.round(img.height * s)
  cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
  return cv.toDataURL('image/jpeg', quality)
}

/**
 * Put the photo somewhere a link can point to. Vercel Blob when it's set up;
 * otherwise squeeze it into the link itself (smaller, and the link gets long).
 */
export async function hostPhoto(dataUrl: string): Promise<{ url: string; inline: boolean }> {
  if (!dataUrl.startsWith('data:')) return { url: dataUrl, inline: false }
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const ext = blob.type.split('/')[1] ?? 'webp'
    const res = await upload(`tops/cake.${ext}`, blob, { access: 'public', handleUploadUrl: '/api/upload' })
    return { url: res.url, inline: false }
  } catch {
    return { url: await shrinkDataUrl(dataUrl, 360, 0.62), inline: true }
  }
}

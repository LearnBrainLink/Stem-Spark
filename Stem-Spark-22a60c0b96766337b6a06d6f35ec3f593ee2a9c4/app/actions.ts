"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  category: string
  grade_level: number
  status: string
  created_at: string
  created_by: string
}

export async function createVideo(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  const videoData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    video_url: formData.get("videoUrl") as string,
    thumbnail_url: formData.get("thumbnailUrl") as string,
    duration: Number.parseInt(formData.get("duration") as string),
    category: formData.get("category") as string,
    grade_level: Number.parseInt(formData.get("gradeLevel") as string),
    created_by: user.id,
    status: "active",
  }

  const { error } = await supabase.from("videos").insert(videoData)

  if (error) {
    return { error: "Failed to create video" }
  }

  // Log activity
  await supabase.from("user_activities").insert({
    user_id: user.id,
    activity_type: "video_created",
    activity_description: `Created video: ${videoData.title}`,
    metadata: { title: videoData.title, category: videoData.category },
  })

  revalidatePath("/admin/videos")
  return { success: true }
}

export async function updateVideo(videoId: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  const videoData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    video_url: formData.get("videoUrl") as string,
    thumbnail_url: formData.get("thumbnailUrl") as string,
    duration: Number.parseInt(formData.get("duration") as string),
    category: formData.get("category") as string,
    grade_level: Number.parseInt(formData.get("gradeLevel") as string),
    status: formData.get("status") as string,
  }

  const { error } = await supabase.from("videos").update(videoData).eq("id", videoId)

  if (error) {
    return { error: "Failed to update video" }
  }

  // Log activity
  await supabase.from("user_activities").insert({
    user_id: user.id,
    activity_type: "video_updated",
    activity_description: `Updated video: ${videoData.title}`,
    metadata: { title: videoData.title, category: videoData.category },
  })

  revalidatePath("/admin/videos")
  return { success: true }
}

export async function deleteVideo(videoId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  // Get video title for logging
  const { data: video } = await supabase.from("videos").select("title").eq("id", videoId).single()

  const { error } = await supabase.from("videos").delete().eq("id", videoId)

  if (error) {
    return { error: "Failed to delete video" }
  }

  // Log activity
  if (video) {
    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "video_deleted",
      activity_description: `Deleted video: ${video.title}`,
      metadata: { title: video.title },
    })
  }

  revalidatePath("/admin/videos")
  return { success: true }
}

export async function getVideos() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { error: "Failed to fetch videos" }
  }

  return { videos }
}

export async function getVideo(videoId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: video, error } = await supabase.from("videos").select("*").eq("id", videoId).single()

  if (error) {
    return { error: "Failed to fetch video" }
  }

  return { video }
} 
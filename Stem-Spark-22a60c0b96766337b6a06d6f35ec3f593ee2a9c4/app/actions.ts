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

function validateVideoData(data: Record<string, any>) {
  const errors: string[] = []

  if (!data.title?.trim()) errors.push("Title is required")
  if (!data.video_url?.trim()) errors.push("Video URL is required")
  if (!data.category?.trim()) errors.push("Category is required")
  if (!data.grade_level || isNaN(Number(data.grade_level))) errors.push("Valid grade level is required")
  if (!data.duration || isNaN(Number(data.duration))) errors.push("Valid duration is required")

  return errors
}

export async function createVideo(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const videoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("videoUrl") as string,
      thumbnail_url: formData.get("thumbnailUrl") as string,
      duration: Number(formData.get("duration") as string),
      category: formData.get("category") as string,
      grade_level: Number(formData.get("gradeLevel") as string),
      created_by: user?.id || "system",
      status: "active",
    }

    // Validate input
    const validationErrors = validateVideoData(videoData)
    if (validationErrors.length > 0) {
      return { error: validationErrors.join(", ") }
    }

    const { error } = await supabase.from("videos").insert(videoData)

    if (error) {
      console.error("Failed to create video:", error)
      return { error: `Failed to create video: ${error.message}` }
    }

    // Log activity
    if (user) {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "video_created",
        activity_description: `Created video: ${videoData.title}`,
        metadata: { title: videoData.title, category: videoData.category },
      })
    }

    revalidatePath("/admin/videos")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in createVideo:", error)
    return { error: "An unexpected error occurred while creating the video" }
  }
}

export async function updateVideo(videoId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const videoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("videoUrl") as string,
      thumbnail_url: formData.get("thumbnailUrl") as string,
      duration: Number(formData.get("duration") as string),
      category: formData.get("category") as string,
      grade_level: Number(formData.get("gradeLevel") as string),
      status: formData.get("status") as string,
    }

    // Validate input
    const validationErrors = validateVideoData(videoData)
    if (validationErrors.length > 0) {
      return { error: validationErrors.join(", ") }
    }

    // Check if video exists
    const { data: existingVideo, error: fetchError } = await supabase
      .from("videos")
      .select("id")
      .eq("id", videoId)
      .single()

    if (fetchError || !existingVideo) {
      return { error: "Video not found" }
    }

    const { error } = await supabase.from("videos").update(videoData).eq("id", videoId)

    if (error) {
      console.error("Failed to update video:", error)
      return { error: `Failed to update video: ${error.message}` }
    }

    // Log activity
    if (user) {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "video_updated",
        activity_description: `Updated video: ${videoData.title}`,
        metadata: { title: videoData.title, category: videoData.category },
      })
    }

    revalidatePath("/admin/videos")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in updateVideo:", error)
    return { error: "An unexpected error occurred while updating the video" }
  }
}

export async function deleteVideo(videoId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get video title for logging
    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("title")
      .eq("id", videoId)
      .single()

    if (fetchError || !video) {
      return { error: "Video not found" }
    }

    const { error } = await supabase.from("videos").delete().eq("id", videoId)

    if (error) {
      console.error("Failed to delete video:", error)
      return { error: `Failed to delete video: ${error.message}` }
    }

    // Log activity
    if (user) {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "video_deleted",
        activity_description: `Deleted video: ${video.title}`,
        metadata: { title: video.title },
      })
    }

    revalidatePath("/admin/videos")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteVideo:", error)
    return { error: "An unexpected error occurred while deleting the video" }
  }
}

export async function getVideos() {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)

    const { data: videos, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch videos:", error)
      return { error: `Failed to fetch videos: ${error.message}` }
    }

    return { videos }
  } catch (error) {
    console.error("Unexpected error in getVideos:", error)
    return { error: "An unexpected error occurred while fetching videos" }
  }
}

export async function getVideo(videoId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(cookieStore)

    const { data: video, error } = await supabase.from("videos").select("*").eq("id", videoId).single()

    if (error) {
      console.error("Failed to fetch video:", error)
      return { error: `Failed to fetch video: ${error.message}` }
    }

    if (!video) {
      return { error: "Video not found" }
    }

    return { video }
  } catch (error) {
    console.error("Unexpected error in getVideo:", error)
    return { error: "An unexpected error occurred while fetching the video" }
  }
} 
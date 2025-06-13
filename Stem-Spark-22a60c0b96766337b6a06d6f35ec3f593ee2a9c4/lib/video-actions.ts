import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

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
  const supabase = createServerClient()

  try {
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
  } catch (error) {
    console.error("Create video error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateVideo(videoId: string, formData: FormData) {
  const supabase = createServerClient()

  try {
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
      metadata: { video_id: videoId, title: videoData.title },
    })

    revalidatePath("/admin/videos")
    return { success: true }
  } catch (error) {
    console.error("Update video error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteVideo(videoId: string) {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in" }
    }

    // Get video info for logging
    const { data: video } = await supabase.from("videos").select("title").eq("id", videoId).single()

    const { error } = await supabase.from("videos").delete().eq("id", videoId)

    if (error) {
      return { error: "Failed to delete video" }
    }

    // Log activity
    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "video_deleted",
      activity_description: `Deleted video: ${video?.title || videoId}`,
      metadata: { video_id: videoId },
    })

    revalidatePath("/admin/videos")
    return { success: true }
  } catch (error) {
    console.error("Delete video error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getVideos() {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { error: "Failed to fetch videos" }
    }

    return { videos: data as Video[] }
  } catch (error) {
    console.error("Get videos error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getVideo(videoId: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("videos").select("*").eq("id", videoId).single()

    if (error) {
      return { error: "Failed to fetch video" }
    }

    return { video: data as Video }
  } catch (error) {
    console.error("Get video error:", error)
    return { error: "An unexpected error occurred" }
  }
} 